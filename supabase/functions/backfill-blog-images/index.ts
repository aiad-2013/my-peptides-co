import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WP_API = 'https://checkout.mypeptideco.com/wp-json/wp/v2';

async function getFeaturedImageForSlug(slug: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${WP_API}/posts?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia&per_page=1`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (!res.ok) return null;
    const posts = await res.json();
    if (!posts || posts.length === 0) return null;
    const post = posts[0];
    const mediaItems = post?._embedded?.['wp:featuredmedia'];
    if (mediaItems && mediaItems.length > 0 && mediaItems[0].source_url) {
      return mediaItems[0].source_url as string;
    }
    return null;
  } catch (e) {
    console.error(`Error fetching image for slug ${slug}:`, e);
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
  try {
    const body = await req.json().catch(() => ({}));
    if (body.offset !== undefined) offset = body.offset;
    if (body.batch_size !== undefined) batchSize = body.batch_size;
  } catch {}

  // Only fetch posts that don't have a featured image yet
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, slug, featured_image')
    .or('featured_image.is.null,featured_image.eq.')
    .range(offset, offset + batchSize - 1);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const results: { slug: string; image: string | null; updated: boolean }[] = [];

  for (const post of posts ?? []) {
    const imageUrl = await getFeaturedImageForSlug(post.slug);
    console.log(`Slug: ${post.slug} → ${imageUrl ?? 'no image found'}`);
    if (imageUrl) {
      const { error: updateErr } = await supabase
        .from('blog_posts')
        .update({ featured_image: imageUrl })
        .eq('id', post.id);
      results.push({ slug: post.slug, image: imageUrl, updated: !updateErr });
    } else {
      results.push({ slug: post.slug, image: null, updated: false });
    }
  }

  const { count } = await supabase
    .from('blog_posts')
    .select('id', { count: 'exact', head: true })
    .or('featured_image.is.null,featured_image.eq.');

  return new Response(JSON.stringify({
    remaining: count,
    offset,
    batchSize,
    processed: results.length,
    hasMore: (count ?? 0) > 0,
    results,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
