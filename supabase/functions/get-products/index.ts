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
  type: string;
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

interface BundledItem {
  id: string;
  wooCommerceId: number;
  name: string;
  image: string;
  price: number;
  qty: number;
  concentration?: string;
  volume?: string;
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
  isBundle?: boolean;
  bundledItems?: BundledItem[];
  savingsText?: string;
  woosb_ids?: Record<string, { id: string; qty: string; sku?: string }>;
  discountTiers?: Array<{ qty: number; discount: number }>;
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
    const baseApi = `${storeUrl}/wp-json/wc/v3/products`;

    // Create Basic Auth header
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const authHeaders = { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' };

    console.log('Fetching products from WooCommerce...');

    // Fetch regular products AND woosb bundles in parallel
    const [regularRes, bundleRes] = await Promise.all([
      fetch(`${baseApi}?per_page=100&status=publish`, { headers: authHeaders }),
      fetch(`${baseApi}?per_page=100&status=publish&type=woosb`, { headers: authHeaders }),
    ]);

    if (!regularRes.ok) throw new Error(`WooCommerce API error: ${regularRes.status}`);
    if (!bundleRes.ok) throw new Error(`WooCommerce bundles API error: ${bundleRes.status}`);

    const [regularProducts, bundleProducts]: [WooCommerceProduct[], WooCommerceProduct[]] = await Promise.all([
      regularRes.json(),
      bundleRes.json(),
    ]);

    // Merge, deduplicating by ID
    const seenIds = new Set<number>();
    const merged: WooCommerceProduct[] = [];
    for (const p of [...regularProducts, ...bundleProducts]) {
      if (!seenIds.has(p.id)) { seenIds.add(p.id); merged.push(p); }
    }

    // Collect any child product IDs referenced by bundles that aren't already fetched
    const missingIds: number[] = [];
    for (const p of merged) {
      const woosb_ids = p.meta_data?.find((m) => m.key === 'woosb_ids')?.value as Record<string, { id: string }> | undefined;
      if (woosb_ids) {
        for (const entry of Object.values(woosb_ids)) {
          const cid = parseInt(entry.id, 10);
          if (!seenIds.has(cid)) missingIds.push(cid);
        }
      }
    }

    // Fetch any missing child products in one request
    if (missingIds.length > 0) {
      const childRes = await fetch(`${baseApi}?include=${[...new Set(missingIds)].join(',')}&per_page=100`, { headers: authHeaders });
      if (childRes.ok) {
        const children: WooCommerceProduct[] = await childRes.json();
        for (const c of children) {
          if (!seenIds.has(c.id)) { seenIds.add(c.id); merged.push(c); }
        }
      }
    }

    const wooProducts = merged;
    console.log(`Fetched ${wooProducts.length} products from WooCommerce`);


    // Transform WooCommerce products to our format
    const products: TransformedProduct[] = wooProducts.map((product) => {
      // Detect bundle products (WPC Product Bundles uses type 'woosb')
      const isBundle = product.type === 'woosb' || product.type === 'bundle';

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
      let discountTiers: Array<{ qty: number; discount: number }> = [];

      let woosb_ids: Record<string, { id: string; qty: string; sku?: string }> | undefined;
      let woosb_after_text = '';

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
        if (meta.key === 'discount_tiers' && meta.value) {
          try {
            const parsed = typeof meta.value === 'string' ? JSON.parse(meta.value) : meta.value;
            if (Array.isArray(parsed)) {
              discountTiers = parsed.filter((t: { qty?: number; discount?: number }) => t.qty && t.discount);
            }
          } catch { /* ignore parse errors */ }
        }
        if (meta.key === 'woosb_ids' && meta.value && typeof meta.value === 'object') {
          woosb_ids = meta.value as Record<string, { id: string; qty: string; sku?: string }>;
        }
        if (meta.key === 'woosb_after_text' && meta.value) {
          woosb_after_text = (meta.value as string).replace(/<[^>]*>/g, '').trim();
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
        badge: badge || (isBundle ? 'Bundle' : undefined),
        inStock: product.stock_status === 'instock',
        wooCommerceUrl: product.permalink,
        dosage: dosage || undefined,
        ingredients: ingredients || undefined,
        faqs: faqs.length > 0 ? faqs : undefined,
        peopleViewing: peopleViewing || undefined,
        isBundle: isBundle || undefined,
        woosb_ids: woosb_ids || undefined,
        savingsText: woosb_after_text || undefined,
        discountTiers: discountTiers.length > 0 ? discountTiers : undefined,
        _isBundle: isBundle,
      };
    });

    // Second pass: resolve bundledItems for bundle products by cross-referencing wooCommerceId
    const idMap = new Map<number, TransformedProduct>();
    for (const p of products) {
      idMap.set(p.wooCommerceId, p);
    }
    for (const p of products) {
      if (p.isBundle && p.woosb_ids) {
        const items: BundledItem[] = [];
        for (const entry of Object.values(p.woosb_ids)) {
          const childId = parseInt(entry.id, 10);
          const child = idMap.get(childId);
          if (child) {
            items.push({
              id: child.id,
              wooCommerceId: child.wooCommerceId,
              name: child.name,
              image: child.image,
              price: child.price,
              qty: parseInt(entry.qty, 10) || 1,
              concentration: child.concentration,
              volume: child.volume,
            });
          }
        }
        if (items.length > 0) p.bundledItems = items;
      }
      // Remove internal-only field before sending to client
      delete p.woosb_ids;
    }

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
