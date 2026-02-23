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

interface ProductFAQ {
  question: string;
  answer: string;
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
  dosage?: string;
  ingredients?: string;
  faqs?: ProductFAQ[];
  peopleViewing?: number;
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

      // Extract custom fields from meta data
      let badge = '';
      let dosage = '';
      let ingredients = '';
      let metaConcentration = '';
      let faqs: ProductFAQ[] = [];
      let peopleViewing = 0;

      for (const meta of product.meta_data || []) {
        if (meta.key === '_product_badge' || meta.key === 'badge') {
          badge = meta.value as string;
        }
        if (meta.key === 'dosage' && meta.value) {
          dosage = meta.value as string;
        }
        if (meta.key === 'ingredients' && meta.value) {
          ingredients = meta.value as string;
        }
        if (meta.key === 'concentration' && meta.value) {
          metaConcentration = meta.value as string;
        }
        if (meta.key === 'people_viewing' && meta.value) {
          peopleViewing = parseInt(meta.value as string, 10) || 0;
        }
        if (meta.key === 'faqs' && meta.value && typeof meta.value === 'string' && meta.value.trim()) {
          // FAQs are HTML with <h3>question</h3> followed by answer text
          const faqHtml = meta.value as string;
          // Split by h3 tags to extract Q&A pairs
          const h3Parts = faqHtml.split(/<h3[^>]*>/i).filter(Boolean);
          for (const part of h3Parts) {
            const closingIdx = part.indexOf('</h3>');
            if (closingIdx === -1) continue;
            const question = part.substring(0, closingIdx).replace(/<[^>]*>/g, '').replace(/^\d+\.\s*/, '').trim();
            const answer = part.substring(closingIdx + 5).replace(/<[^>]*>/g, '').trim();
            if (question && answer) {
              faqs.push({ question, answer });
            }
          }
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
        concentration: concentration || metaConcentration || undefined,
        volume: volume || undefined,
        description,
        image: product.images?.[0]?.src || '/placeholder.svg',
        badge: badge || undefined,
        inStock: product.stock_status === 'instock',
        wooCommerceUrl: product.permalink,
        dosage: dosage || undefined,
        ingredients: ingredients || undefined,
        faqs: faqs.length > 0 ? faqs : undefined,
        peopleViewing: peopleViewing || undefined,
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
