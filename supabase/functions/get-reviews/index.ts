import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return new Response(JSON.stringify({ error: 'product_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const consumerKey = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET');

    if (!consumerKey || !consumerSecret) {
      throw new Error('WooCommerce API credentials not configured');
    }

    const storeUrl = 'https://checkout.mypeptideco.com';
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const authHeaders = { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' };

    const res = await fetch(
      `${storeUrl}/wp-json/wc/v3/products/reviews?product=${productId}&per_page=50&status=approved`,
      { headers: authHeaders }
    );

    if (!res.ok) {
      throw new Error(`WooCommerce reviews API error: ${res.status}`);
    }

    const raw = await res.json();

    const reviews = raw.map((r: {
      id: number;
      date_created: string;
      review: string;
      rating: number;
      reviewer: string;
      reviewer_avatar_urls?: Record<string, string>;
      verified: boolean;
    }) => ({
      id: r.id,
      date: r.date_created,
      review: r.review.replace(/<[^>]*>/g, '').trim(),
      rating: r.rating,
      reviewer: r.reviewer,
      avatar: r.reviewer_avatar_urls?.['48'] || null,
      verified: r.verified,
    }));

    return new Response(JSON.stringify({ reviews }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching reviews:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
