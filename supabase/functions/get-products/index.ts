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
  status: string;
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
  category: 'sarms' | 'peptides' | 'glp-1' | 'erectile-performance' | 'dilutes';
  categories?: Array<'sarms' | 'peptides' | 'glp-1' | 'erectile-performance' | 'dilutes'>;
  price: number;
  concentration?: string;
  volume?: string;
  description: string;
  image: string;
  images?: string[];
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

// Decode HTML entities (numeric + common named) left behind after tag-stripping
function decodeHtmlEntities(str: string): string {
  return str
    // Decimal numeric entities: &#8217; → '
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    // Hex numeric entities: &#x2019; → '
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    // Common named entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&mdash;/g, '\u2014');
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

    const storeUrl = 'https://checkout.mypeptideco.com';
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

    // Fetch any missing child products in one request — status=publish excludes drafts
    if (missingIds.length > 0) {
      const childRes = await fetch(`${baseApi}?include=${[...new Set(missingIds)].join(',')}&status=publish&per_page=100`, { headers: authHeaders });
      if (childRes.ok) {
        const children: WooCommerceProduct[] = await childRes.json();
        for (const c of children) {
          if (!seenIds.has(c.id)) { seenIds.add(c.id); merged.push(c); }
        }
      }
    }

    // Safety filter: only keep products explicitly published (excludes draft, pending, private)
    const wooProducts = merged.filter(p => p.status === 'publish');
    console.log(`Fetched ${wooProducts.length} published products from WooCommerce (${merged.length} total before filter)`);


    // Transform WooCommerce products to our format
    const products: TransformedProduct[] = wooProducts.map((product) => {
      // Detect bundle products (WPC Product Bundles uses type 'woosb')
      const isBundle = product.type === 'woosb' || product.type === 'bundle';

      // Slug-based category overrides — source of truth for routing.
      // Any product slug listed here takes precedence over WooCommerce category assignment.
      const SLUG_CATEGORY_MAP: Record<string, 'sarms' | 'peptides' | 'glp-1' | 'erectile-performance' | 'dilutes'> = {
        // SARMs
        'testolone-rad140': 'sarms',
        'lgd-4033': 'sarms',
        'growth-mk677': 'sarms',
        'shred-sr9009': 'sarms',
        'mk-2866': 'sarms',
        // GLP-1
        'retatrutide': 'glp-1',
        'tirzepatide': 'glp-1',
        '5-amino-1mq': 'glp-1',
        // Peptides
        'tesamorelin': 'peptides',
        'bpc-157': 'peptides',
        'tb-500': 'peptides',
        'ghk-cu': 'peptides',
        'pt-141': 'peptides',
        'melanotan-ii': 'peptides',
        'cjc-1295-dac': 'peptides',
        'ipamorelin': 'peptides',
        'nad-500-mg-nicotinamide-adenine-dinucleotide': 'peptides',
        'hgh': 'peptides',
        'hcg': 'peptides',
        'glow-blend': 'peptides',
        'klow-blend': 'peptides',
        'bacteriostatic-water-bac-water': 'peptides',
        'dsip': 'peptides',
        'mots-c': 'peptides',
        // Dilutes / PCT
        'clomid-clomiphene-citrate': 'dilutes',
        'nolvadex-tamoxifen': 'dilutes',
      };

      // Products that appear in multiple categories
      const MULTI_CATEGORY_MAP: Record<string, Array<'sarms' | 'peptides' | 'glp-1' | 'erectile-performance' | 'dilutes'>> = {
        'hcg': ['peptides', 'dilutes'],
        'pt-141': ['peptides', 'erectile-performance'],
      };

      // Determine category: slug override first, then fall back to WooCommerce category strings
      let category: 'sarms' | 'peptides' | 'glp-1' | 'erectile-performance' | 'dilutes';
      if (SLUG_CATEGORY_MAP[product.slug]) {
        category = SLUG_CATEGORY_MAP[product.slug];
      } else {
        const categorySlugs = (product.categories || []).map(c => c.slug?.toLowerCase() || '');
        const categoryNames = (product.categories || []).map(c => c.name?.toLowerCase() || '');
        const allCatStrings = [...categorySlugs, ...categoryNames].join(' ');
        if (allCatStrings.includes('glp-1') || allCatStrings.includes('glp1') || allCatStrings.includes('weight-loss') || allCatStrings.includes('weight loss')) {
          category = 'glp-1';
        } else if (allCatStrings.includes('dilute') || allCatStrings.includes('pct') || allCatStrings.includes('post cycle')) {
          category = 'dilutes';
        } else if (allCatStrings.includes('peptide')) {
          category = 'peptides';
        } else {
          category = 'sarms';
        }
      }

      const categories = MULTI_CATEGORY_MAP[product.slug] || undefined;

      // Extract volume from attributes only (we derive concentration from dosage meta, not attributes)
      let volume = '';
      
      for (const attr of product.attributes || []) {
        const attrName = attr.name.toLowerCase();
        if (attrName.includes('volume') || attrName.includes('size') || attrName === 'ml') {
          volume = attr.options?.[0] || '';
        }
      }

      // Extract custom fields from meta data
      let badge = '';
      let dosage = '';
      let ingredients = '';
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
          dosage = (meta.value as string).trim();
        }
        if (meta.key === 'ingredients' && meta.value) {
          ingredients = meta.value as string;
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
            const answer = decodeHtmlEntities(part.substring(closingIdx + 5).replace(/<[^>]*>/g, '').trim());
            const decodedQuestion = decodeHtmlEntities(question);
            if (decodedQuestion && answer) {
              faqs.push({ question: decodedQuestion, answer });
            }
          }
        }
      }

      // Derive concentration from the dosage field if it contains a mg/ml-style value (liquid products).
      // Otherwise fall back to parsing the product name for a dosage pattern.
      let concentration = '';
      const dosageLooksLikeConcentration = /\d+\s*mg\s*\/\s*ml/i.test(dosage);
      if (dosageLooksLikeConcentration) {
        // Normalise spacing: "15mg / ml" → "15mg/ml"
        concentration = dosage.replace(/\s*\/\s*/g, '/').replace(/\s+/g, '');
      } else if (!dosage) {
        // Last-resort: parse concentration directly from the product name
        const nameMatch = product.name.match(/\b(\d+(?:\.\d+)?(?:mg\/ml|mg|iu|ml))\b/i);
        if (nameMatch) concentration = nameMatch[1];
      }

      // Strip HTML tags then decode HTML entities from description
      const rawDesc = product.short_description?.replace(/<[^>]*>/g, '').trim()
        || product.description?.replace(/<[^>]*>/g, '').trim() || '';
      const description = decodeHtmlEntities(rawDesc);

      return {
        id: product.slug,
        wooCommerceId: product.id,
        name: product.name,
        category,
        categories,
        price: parseFloat(product.price) || 0,
        concentration: concentration || undefined,
        volume: volume || undefined,
        description,
        ...(() => {
          const imgs = (product.images || []).filter(img => img.src);
          // Push molecular/structure/diagram images to the end so the product photo is always first
          const structureKeywords = /structure|molecule|molecular|chemical|diagram|formula/i;
          const primary = imgs.filter(img => !structureKeywords.test(img.alt || ''));
          const secondary = imgs.filter(img => structureKeywords.test(img.alt || ''));
          const ordered = [...primary, ...secondary].map(img => img.src);
          return { image: ordered[0] || '/placeholder.svg', images: ordered };
        })(),
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
        // Use product-level tiers if set; otherwise fall back to the store-wide volume discount rules for non-bundle products
        discountTiers: discountTiers.length > 0 ? discountTiers : (!isBundle ? [
          { qty: 3, discount: 10 },
          { qty: 6, discount: 15 },
          { qty: 9, discount: 20 },
        ] : undefined),
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
