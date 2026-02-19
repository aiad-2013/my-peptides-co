const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const WP_BASE = 'https://vicorpus.com/wp-json/wp/v2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    const perPage = url.searchParams.get('per_page') || '20';

    let wpUrl: string;

    if (slug) {
      // Fetch single post by slug with full content
      wpUrl = `${WP_BASE}/posts?slug=${encodeURIComponent(slug)}&_fields=id,slug,title,content,excerpt,date,featured_media,categories&_embed=wp:featuredmedia`;
    } else {
      // Fetch listing with excerpts only
      wpUrl = `${WP_BASE}/posts?per_page=${perPage}&_fields=id,slug,title,excerpt,date,featured_media,categories&_embed=wp:featuredmedia&orderby=date&order=desc`;
    }

    console.log('Fetching from WordPress:', wpUrl);

    const wpRes = await fetch(wpUrl);
    if (!wpRes.ok) {
      throw new Error(`WordPress API returned ${wpRes.status}`);
    }

    const posts = await wpRes.json();

    // Also fetch categories for mapping
    const catRes = await fetch(`${WP_BASE}/categories?_fields=id,name,slug&per_page=50`);
    const categories = catRes.ok ? await catRes.json() : [];

    // Build category map
    const catMap: Record<number, { name: string; slug: string }> = {};
    for (const cat of categories) {
      catMap[cat.id] = { name: cat.name, slug: cat.slug };
    }

    // Transform posts to include featured image URL and category names
    const transformed = posts.map((post: any) => {
      let featuredImage = '';
      if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
        featuredImage = post._embedded['wp:featuredmedia'][0].source_url;
      }

      const postCategories = (post.categories || []).map((id: number) => catMap[id] || { name: 'Uncategorized', slug: 'uncategorized' });

      return {
        id: post.id,
        slug: post.slug,
        title: post.title?.rendered || '',
        excerpt: post.excerpt?.rendered || '',
        content: post.content?.rendered || undefined,
        date: post.date,
        featuredImage,
        categories: postCategories,
      };
    });

    return new Response(JSON.stringify(transformed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch blog posts';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
