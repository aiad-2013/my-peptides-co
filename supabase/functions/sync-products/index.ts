import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STORE_URL = 'https://checkout.mypeptideco.com';
const BUCKET = 'product-images';

// ---------- types ----------
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
  meta_data: Array<{ key: string; value: unknown }>;
}

interface ProductFAQ { question: string; answer: string; }
interface BundledItem {
  id: string; wooCommerceId: number; name: string; image: string;
  price: number; qty: number; concentration?: string; volume?: string;
}

interface TransformedProduct {
  id: string;
  wooCommerceId: number;
  name: string;
  category: string;
  categories?: string[];
  price: number;
  regularPrice?: number;
  salePrice?: number;
  concentration?: string;
  volume?: string;
  description: string;
  shortDescription?: string;
  longDescription?: string;
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

// ---------- helpers ----------
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;/g, '\u2019').replace(/&lsquo;/g, '\u2018')
    .replace(/&rdquo;/g, '\u201D').replace(/&ldquo;/g, '\u201C')
    .replace(/&ndash;/g, '\u2013').replace(/&mdash;/g, '\u2014');
}

async function sha1Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function extFromContentType(ct: string, fallbackUrl: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
    'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg',
    'image/avif': 'avif',
  };
  const fromCt = map[ct.split(';')[0].trim().toLowerCase()];
  if (fromCt) return fromCt;
  const m = fallbackUrl.split('?')[0].match(/\.([a-z0-9]{2,5})$/i);
  return (m?.[1] || 'jpg').toLowerCase();
}

// ---------- WooCommerce fetch ----------
async function fetchAllWooProducts(): Promise<WooCommerceProduct[]> {
  const consumerKey = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY');
  const consumerSecret = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET');
  if (!consumerKey || !consumerSecret) throw new Error('WooCommerce credentials missing');

  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  const headers = { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' };
  const baseApi = `${STORE_URL}/wp-json/wc/v3/products`;

  const [regularRes, bundleRes] = await Promise.all([
    fetch(`${baseApi}?per_page=100&status=publish`, { headers }),
    fetch(`${baseApi}?per_page=100&status=publish&type=woosb`, { headers }),
  ]);
  if (!regularRes.ok) throw new Error(`WC API error: ${regularRes.status}`);
  if (!bundleRes.ok) throw new Error(`WC bundles error: ${bundleRes.status}`);

  const [regular, bundles]: [WooCommerceProduct[], WooCommerceProduct[]] = await Promise.all([
    regularRes.json(), bundleRes.json(),
  ]);

  const seen = new Set<number>();
  const merged: WooCommerceProduct[] = [];
  for (const p of [...regular, ...bundles]) {
    if (!seen.has(p.id)) { seen.add(p.id); merged.push(p); }
  }

  // Pull missing children referenced by bundles
  const missing: number[] = [];
  for (const p of merged) {
    const ids = p.meta_data?.find(m => m.key === 'woosb_ids')?.value as Record<string, { id: string }> | undefined;
    if (ids) for (const e of Object.values(ids)) {
      const cid = parseInt(e.id, 10);
      if (!seen.has(cid)) missing.push(cid);
    }
  }
  if (missing.length > 0) {
    const childRes = await fetch(`${baseApi}?include=${[...new Set(missing)].join(',')}&status=publish&per_page=100`, { headers });
    if (childRes.ok) {
      const children: WooCommerceProduct[] = await childRes.json();
      for (const c of children) if (!seen.has(c.id)) { seen.add(c.id); merged.push(c); }
    }
  }

  return merged.filter(p => p.status === 'publish');
}

// ---------- transform (mirrors get-products original logic) ----------
function transform(product: WooCommerceProduct): TransformedProduct {
  const isBundle = product.type === 'woosb' || product.type === 'bundle';
  const categorySlugs = (product.categories || []).map(c => c.slug?.toLowerCase() || '');
  const categoryNames = (product.categories || []).map(c => c.name?.toLowerCase() || '');
  const allCat = [...categorySlugs, ...categoryNames].join(' ');

  let category: string;
  const slugOverrides: Record<string, string> = { 'bacteriostatic-water-bac-water': 'dilutes' };
  if (slugOverrides[product.slug]) category = slugOverrides[product.slug];
  else if (allCat.includes('erectile') || allCat.includes('sexual') || allCat.includes('performance')) category = 'erectile-performance';
  else if (allCat.includes('glp-1') || allCat.includes('glp1') || allCat.includes('weight-loss') || allCat.includes('weight loss') || allCat.includes('tirzepatide') || allCat.includes('retatrutide') || allCat.includes('semaglutide')) category = 'glp-1';
  else if (allCat.includes('pct') || allCat.includes('post cycle') || allCat.includes('post-cycle')) category = 'pct';
  else if (allCat.includes('dilute') || allCat.includes('bacteriostatic') || allCat.includes('bac water')) category = 'dilutes';
  else if (allCat.includes('peptide') || allCat.includes('amino') || allCat.includes('nad') || allCat.includes('hgh') || allCat.includes('hcg') || allCat.includes('bac')) category = 'peptides';
  else if (allCat.includes('sarm')) category = 'sarms';
  else category = 'sarms';

  const multiCats: string[] = [];
  const push = (c: string) => { if (!multiCats.includes(c)) multiCats.push(c); };
  for (const slug of categorySlugs) {
    if (slug.includes('sarm')) push('sarms');
    else if (slug.includes('peptide') || slug.includes('nad') || slug.includes('hgh') || slug.includes('hcg') || slug.includes('bac')) push('peptides');
    else if (slug.includes('glp') || slug.includes('weight')) push('glp-1');
    else if (slug.includes('pct') || slug.includes('post-cycle')) push('pct');
    else if (slug.includes('dilute')) push('dilutes');
    else if (slug.includes('erectile') || slug.includes('sexual') || slug.includes('performance')) push('erectile-performance');
  }
  for (const name of categoryNames) {
    if (name.includes('erectile') || name.includes('sexual') || name.includes('performance')) push('erectile-performance');
    if (name.includes('peptide')) push('peptides');
    if (name.includes('pct') || name.includes('post cycle')) push('pct');
    if (name.includes('dilute')) push('dilutes');
    if (name.includes('glp') || name.includes('weight loss')) push('glp-1');
    if (name.includes('sarm')) push('sarms');
  }
  const categories = multiCats.length > 1 ? multiCats : undefined;

  let volume = '';
  for (const attr of product.attributes || []) {
    const an = attr.name.toLowerCase();
    if (an.includes('volume') || an.includes('size') || an === 'ml') volume = attr.options?.[0] || '';
  }

  let badge = '', dosage = '', ingredients = '', peopleViewing = 0;
  let faqs: ProductFAQ[] = [];
  let discountTiers: Array<{ qty: number; discount: number }> = [];
  let woosb_ids: Record<string, { id: string; qty: string; sku?: string }> | undefined;
  let woosb_after_text = '';

  for (const meta of product.meta_data || []) {
    if (meta.key === '_product_badge' || meta.key === 'badge') badge = meta.value as string;
    if (meta.key === 'dosage' && meta.value) dosage = (meta.value as string).trim();
    if (meta.key === 'ingredients' && meta.value) ingredients = meta.value as string;
    if (meta.key === 'people_viewing' && meta.value) peopleViewing = parseInt(meta.value as string, 10) || 0;
    if (meta.key === 'discount_tiers' && meta.value) {
      try {
        const parsed = typeof meta.value === 'string' ? JSON.parse(meta.value) : meta.value;
        if (Array.isArray(parsed)) discountTiers = parsed.filter((t: { qty?: number; discount?: number }) => t.qty && t.discount);
      } catch { /* ignore */ }
    }
    if (meta.key === 'woosb_ids' && meta.value && typeof meta.value === 'object') {
      woosb_ids = meta.value as Record<string, { id: string; qty: string; sku?: string }>;
    }
    if (meta.key === 'woosb_after_text' && meta.value) {
      woosb_after_text = (meta.value as string).replace(/<[^>]*>/g, '').trim();
    }
    if (meta.key === 'faqs' && meta.value && typeof meta.value === 'string' && meta.value.trim()) {
      const parts = (meta.value as string).split(/<h3[^>]*>/i).filter(Boolean);
      for (const part of parts) {
        const ci = part.indexOf('</h3>');
        if (ci === -1) continue;
        const q = part.substring(0, ci).replace(/<[^>]*>/g, '').replace(/^\d+\.\s*/, '').trim();
        const a = decodeHtmlEntities(part.substring(ci + 5).replace(/<[^>]*>/g, '').trim());
        const dq = decodeHtmlEntities(q);
        if (dq && a) faqs.push({ question: dq, answer: a });
      }
    }
  }

  let concentration = '';
  if (/\d+\s*mg\s*\/\s*ml/i.test(dosage)) {
    concentration = dosage.replace(/\s*\/\s*/g, '/').replace(/\s+/g, '');
  } else if (!dosage) {
    const m = product.name.match(/\b(\d+(?:\.\d+)?(?:mg\/ml|mg|iu|ml))\b/i);
    if (m) concentration = m[1];
  }

  const rawShort = product.short_description?.trim() || '';
  const rawLong = product.description?.trim() || '';
  const description = decodeHtmlEntities(rawShort || rawLong);
  const shortDescription = rawShort ? decodeHtmlEntities(rawShort) : undefined;
  const longDescription = rawLong ? decodeHtmlEntities(rawLong) : undefined;

  const imgs = (product.images || []).filter(img => img.src);
  const structureKeywords = /structure|molecule|molecular|chemical|diagram|formula/i;
  const primary = imgs.filter(img => !structureKeywords.test(img.alt || ''));
  const secondary = imgs.filter(img => structureKeywords.test(img.alt || ''));
  const ordered = [...primary, ...secondary].map(img => img.src);

  return {
    id: product.slug,
    wooCommerceId: product.id,
    name: product.name,
    category,
    categories,
    price: parseFloat(product.price) || 0,
    regularPrice: product.sale_price && parseFloat(product.sale_price) > 0 ? parseFloat(product.regular_price) || undefined : undefined,
    salePrice: product.sale_price && parseFloat(product.sale_price) > 0 ? parseFloat(product.sale_price) || undefined : undefined,
    concentration: concentration || undefined,
    volume: volume || undefined,
    description,
    shortDescription,
    longDescription,
    image: ordered[0] || '/placeholder.svg',
    images: ordered,
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
    discountTiers: discountTiers.length > 0 ? discountTiers : (!isBundle ? [
      { qty: 3, discount: 10 }, { qty: 6, discount: 15 }, { qty: 9, discount: 20 },
    ] : undefined),
  };
}

// Resolve bundledItems by cross-referencing
function resolveBundles(products: TransformedProduct[]): void {
  const idMap = new Map<number, TransformedProduct>();
  for (const p of products) idMap.set(p.wooCommerceId, p);
  for (const p of products) {
    if (p.isBundle && p.woosb_ids) {
      const items: BundledItem[] = [];
      for (const e of Object.values(p.woosb_ids)) {
        const child = idMap.get(parseInt(e.id, 10));
        if (child) items.push({
          id: child.id, wooCommerceId: child.wooCommerceId, name: child.name,
          image: child.image, price: child.price, qty: parseInt(e.qty, 10) || 1,
          concentration: child.concentration, volume: child.volume,
        });
      }
      if (items.length > 0) p.bundledItems = items;
    }
    delete p.woosb_ids;
  }
}

// ---------- image mirroring ----------
async function mirrorImages(
  supabase: ReturnType<typeof createClient>,
  product: TransformedProduct,
  existingMap: Record<string, string>,
): Promise<Record<string, string>> {
  const newMap: Record<string, string> = {};
  const sourceUrls = product.images || [];

  for (const src of sourceUrls) {
    if (!src || src.startsWith('/')) { newMap[src] = src; continue; }

    if (existingMap[src]) { newMap[src] = existingMap[src]; continue; }

    try {
      const hash = (await sha1Hex(src)).substring(0, 16);
      const res = await fetch(src, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ProductSync/1.0)',
          'Referer': `${STORE_URL}/`,
          'Accept': 'image/*',
        },
      });
      if (!res.ok) {
        console.warn(`[sync] Image fetch failed ${res.status} for ${src}`);
        newMap[src] = src;
        continue;
      }
      const ct = res.headers.get('content-type') || 'image/jpeg';
      const ext = extFromContentType(ct, src);
      const path = `${product.id}/${hash}.${ext}`;
      const buf = await res.arrayBuffer();

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, buf, { contentType: ct, upsert: true, cacheControl: '604800' });

      if (upErr) {
        console.warn(`[sync] Upload failed for ${path}: ${upErr.message}`);
        newMap[src] = src;
        continue;
      }

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      newMap[src] = pub.publicUrl;
    } catch (e) {
      console.warn(`[sync] Mirror error for ${src}:`, e instanceof Error ? e.message : e);
      newMap[src] = src;
    }
  }

  return newMap;
}

function applyImageMap(p: TransformedProduct, map: Record<string, string>): TransformedProduct {
  const mappedImages = (p.images || []).map(u => map[u] || u);
  const out: TransformedProduct = {
    ...p,
    image: map[p.image] || p.image,
    images: mappedImages,
  };
  if (out.bundledItems) {
    out.bundledItems = out.bundledItems.map(b => ({ ...b, image: map[b.image] || b.image }));
  }
  return out;
}

// ---------- sync orchestration ----------
async function syncProducts(opts: { slug?: string; wooCommerceId?: number; full?: boolean }) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  console.log('[sync] Fetching WooCommerce catalog...');
  const all = await fetchAllWooProducts();
  const transformed = all.map(transform);
  resolveBundles(transformed);

  let targets = transformed;
  if (opts.slug) targets = transformed.filter(p => p.id === opts.slug);
  else if (opts.wooCommerceId) targets = transformed.filter(p => p.wooCommerceId === opts.wooCommerceId);

  console.log(`[sync] Syncing ${targets.length} of ${transformed.length} products`);

  const slugs = targets.map(t => t.id);
  const { data: existing } = await supabase
    .from('products_cache')
    .select('slug, image_map')
    .in('slug', slugs);
  const existingMaps = new Map<string, Record<string, string>>();
  for (const row of existing || []) {
    existingMaps.set(row.slug as string, (row.image_map as Record<string, string>) || {});
  }

  let synced = 0;
  for (const p of targets) {
    try {
      const existingMap = existingMaps.get(p.id) || {};
      const imageMap = await mirrorImages(supabase, p, existingMap);
      const productWithMirror = applyImageMap(p, imageMap);

      const { error } = await supabase
        .from('products_cache')
        .upsert({
          slug: p.id,
          woocommerce_id: p.wooCommerceId,
          data: productWithMirror,
          image_map: imageMap,
          synced_at: new Date().toISOString(),
        }, { onConflict: 'slug' });

      if (error) {
        console.error(`[sync] Upsert failed for ${p.id}:`, error.message);
      } else {
        synced++;
      }
    } catch (e) {
      console.error(`[sync] Failed ${p.id}:`, e instanceof Error ? e.message : e);
    }
  }

  if (opts.full) {
    const liveSlugs = new Set(transformed.map(t => t.id));
    const { data: cached } = await supabase.from('products_cache').select('slug');
    const stale = (cached || []).map(r => r.slug as string).filter(s => !liveSlugs.has(s));
    if (stale.length > 0) {
      const { error } = await supabase.from('products_cache').delete().in('slug', stale);
      if (error) console.error('[sync] Prune failed:', error.message);
      else console.log(`[sync] Pruned ${stale.length} stale products`);
    }
  }

  await supabase.from('cache_invalidations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', 'products');

  return { synced, total: transformed.length };
}

// ---------- HTTP entry ----------
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    let body: { slug?: string; wooCommerceId?: number; full?: boolean } = {};
    if (req.method === 'POST') {
      try { body = await req.json(); } catch { /* default to {} */ }
    } else {
      const url = new URL(req.url);
      const slug = url.searchParams.get('slug');
      const id = url.searchParams.get('wooCommerceId');
      const full = url.searchParams.get('full');
      if (slug) body.slug = slug;
      if (id) body.wooCommerceId = parseInt(id, 10);
      if (full === 'true' || full === '1') body.full = true;
    }

    if (!body.slug && !body.wooCommerceId) body.full = true;

    const result = await syncProducts(body);
    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[sync] Fatal:', msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
