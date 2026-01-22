import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  images: Array<{ id: number; src: string; alt: string }>;
  stock_status: string;
  attributes: Array<{ id: number; name: string; options: string[] }>;
  meta_data: Array<{ key: string; value: string }>;
}

interface TransformedProduct {
  id: string;
  wooCommerceId: number;
  name: string;
  category: 'sarms' | 'peptides';
  price: number;
  concentration?: string;
  volume?: string;
  description: string;
  image: string;
  badge?: string;
  inStock: boolean;
  wooCommerceUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const consumerKey = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET');

    if (!consumerKey || !consumerSecret) {
      throw new Error('WooCommerce API credentials not configured');
    }

    const storeUrl = 'https://vicorpus.co';
    const apiUrl = `${storeUrl}/wp-json/wc/v3/products?per_page=100&status=publish`;

    // Create Basic Auth header
    const auth = btoa(`${consumerKey}:${consumerSecret}`);

    console.log('Fetching products from WooCommerce...');

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WooCommerce API error:', response.status, errorText);
      throw new Error(`WooCommerce API error: ${response.status}`);
    }

    const wooProducts: WooCommerceProduct[] = await response.json();
    console.log(`Fetched ${wooProducts.length} products from WooCommerce`);

    // Transform WooCommerce products to our format
    const products: TransformedProduct[] = wooProducts.map((product) => {
      // Determine category from WooCommerce categories
      const categorySlug = product.categories?.[0]?.slug?.toLowerCase() || '';
      const category: 'sarms' | 'peptides' = 
        categorySlug.includes('peptide') ? 'peptides' : 'sarms';

      // Extract concentration and volume from attributes or meta
      let concentration = '';
      let volume = '';
      
      for (const attr of product.attributes || []) {
        const attrName = attr.name.toLowerCase();
        if (attrName.includes('concentration') || attrName.includes('strength')) {
          concentration = attr.options?.[0] || '';
        }
        if (attrName.includes('volume') || attrName.includes('size')) {
          volume = attr.options?.[0] || '';
        }
      }

      // Look for badge in meta data
      let badge = '';
      for (const meta of product.meta_data || []) {
        if (meta.key === '_product_badge' || meta.key === 'badge') {
          badge = meta.value;
        }
      }

      // Strip HTML from description
      const description = product.short_description
        ?.replace(/<[^>]*>/g, '')
        .trim() || product.description?.replace(/<[^>]*>/g, '').trim() || '';

      return {
        id: product.slug,
        wooCommerceId: product.id,
        name: product.name,
        category,
        price: parseFloat(product.price) || 0,
        concentration: concentration || undefined,
        volume: volume || undefined,
        description,
        image: product.images?.[0]?.src || '/placeholder.svg',
        badge: badge || undefined,
        inStock: product.stock_status === 'instock',
        wooCommerceUrl: product.permalink,
      };
    });

    return new Response(JSON.stringify({ products }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching products:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
