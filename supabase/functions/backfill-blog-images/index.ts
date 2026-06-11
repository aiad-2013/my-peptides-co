import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WP_API = 'https://checkout.mypeptideco.com/wp-json/wp/v2';
const BUCKET = 'product-images';
const PREFIX = 'blog';

async function getFeaturedImageForSlug(slug: string): Promise<string | null> {
  try {
    const url = `${WP_API}/posts?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia&per_page=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      console.log(`[${slug}] WP posts fetch failed: ${res.status} ${res.statusText}`);
      return null;
    }
    const posts = await res.json();
    if (!posts || posts.length === 0) {
      console.log(`[${slug}] WP returned no posts`);
      return null;
    }
    const post = posts[0];
    console.log(`[${slug}] post.id=${post?.id} featured_media=${post?.featured_media} embedded=${!!post?._embedded}`);

    // 1. Try _embedded featured media
    const mediaItems = post?._embedded?.['wp:featuredmedia'];
    if (mediaItems && mediaItems.length > 0 && mediaItems[0]?.source_url) {
      return mediaItems[0].source_url as string;
    }

    // 2. Fallback: fetch media directly by featured_media ID
    const mediaId = post?.featured_media;
    if (mediaId && mediaId > 0) {
      const mres = await fetch(`${WP_API}/media/${mediaId}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (mres.ok) {
        const media = await mres.json();
        if (media?.source_url) return media.source_url as string;
        if (media?.guid?.rendered) return media.guid.rendered as string;
      }
    }

    // 3. Fallback: parse first image from content
    const html = post?.content?.rendered as string | undefined;
    if (html) {
      const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (m && m[1]) return m[1];
    }

    return null;
  } catch (e) {
    console.error(`Error fetching image for slug ${slug}:`, e);
    return null;
  }
}

async function mirrorToStorage(
  supabase: any,
  sourceUrl: string,
  slug: string,
): Promise<string | null> {
  try {
    // Try direct fetch first, then fallback through image-proxy if needed
    const candidates = [sourceUrl];
    if (sourceUrl.includes('checkout.mypeptideco.com')) {
      const proxyBase = `${Deno.env.get('SUPABASE_URL')}/functions/v1/image-proxy?url=`;
      candidates.push(`${proxyBase}${encodeURIComponent(sourceUrl)}`);
    }

    let buf: ArrayBuffer | null = null;
    let contentType = 'image/jpeg';
    for (const u of candidates) {
      const r = await fetch(u, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'image/*',
          'Referer': 'https://checkout.mypeptideco.com/',
        },
      });
      if (r.ok) {
        const ct = r.headers.get('content-type') || '';
        if (ct.startsWith('image/')) {
          contentType = ct;
          buf = await r.arrayBuffer();
          break;
        }
      }
    }
    if (!buf) {
      console.error(`Could not download image for ${slug} from ${sourceUrl}`);
      return null;
    }

    const ext = contentType.split('/')[1]?.split(';')[0] || 'jpg';
    const path = `${PREFIX}/${slug}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, buf, { contentType, upsert: true });
    if (upErr) {
      console.error(`Upload failed for ${slug}:`, upErr.message);
      return null;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.error(`mirrorToStorage error for ${slug}:`, e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let offset = 0;
  let batchSize = 10;
  let refetchAll = false;
  try {
    const body = await req.json().catch(() => ({}));
    if (body.offset !== undefined) offset = body.offset;
    if (body.batch_size !== undefined) batchSize = body.batch_size;
    if (body.refetch_all) refetchAll = true;
  } catch {}

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  // We want to (re)mirror any post whose featured_image is missing, broken
  // (vicorpus.com), or not yet mirrored to our own Supabase Storage.
  let query = supabase.from('blog_posts').select('id, slug, featured_image');
  if (!refetchAll) {
    query = query.or(
      `featured_image.is.null,featured_image.eq.,featured_image.ilike.%vicorpus.com%,featured_image.not.ilike.%${new URL(SUPABASE_URL).host}%`,
    );
  }
  const { data: posts, error } = await query.range(offset, offset + batchSize - 1);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const results: { slug: string; source: string | null; stored: string | null; updated: boolean }[] = [];

  for (const post of posts ?? []) {
    const sourceUrl = await getFeaturedImageForSlug(post.slug);
    if (!sourceUrl) {
      console.log(`No WP image for ${post.slug}`);
      results.push({ slug: post.slug, source: null, stored: null, updated: false });
      continue;
    }
    const stored = await mirrorToStorage(supabase, sourceUrl, post.slug);
    if (stored) {
      const { error: updateErr } = await supabase
        .from('blog_posts')
        .update({ featured_image: stored })
        .eq('id', post.id);
      results.push({ slug: post.slug, source: sourceUrl, stored, updated: !updateErr });
    } else {
      results.push({ slug: post.slug, source: sourceUrl, stored: null, updated: false });
    }
  }

  const { count } = await supabase
    .from('blog_posts')
    .select('id', { count: 'exact', head: true })
    .or(
      `featured_image.is.null,featured_image.eq.,featured_image.ilike.%vicorpus.com%,featured_image.not.ilike.%${new URL(SUPABASE_URL).host}%`,
    );

  return new Response(
    JSON.stringify({
      remaining: count,
      offset,
      batchSize,
      processed: results.length,
      hasMore: (count ?? 0) > 0,
      results,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
