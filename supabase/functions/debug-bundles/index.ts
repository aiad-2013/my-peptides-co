import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const consumerKey = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY');
  const consumerSecret = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET');
  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  const base = 'https://vicorpus.co/wp-json/wc/v3';

  // Fetch ALL woosb bundles (any status)
  const bundlesRes = await fetch(`${base}/products?type=woosb&per_page=100&status=any`, {
    headers: { 'Authorization': `Basic ${auth}` },
  });
  const bundles = await bundlesRes.json();

  // For each bundle, extract woosb_ids and bundled product names
  const summary = await Promise.all(bundles.map(async (b: { id: number; name: string; status: string; price: string; meta_data: Array<{ key: string; value: unknown }> }) => {
    const woosb_ids = b.meta_data?.find((m) => m.key === 'woosb_ids')?.value as Record<string, { id: string; qty: string; sku?: string }> | undefined;
    const after_text = b.meta_data?.find((m) => m.key === 'woosb_after_text')?.value;

    let bundled_names: string[] = [];
    if (woosb_ids) {
      const ids = Object.values(woosb_ids).map((v) => v.id).join(',');
      const childRes = await fetch(`${base}/products?include=${ids}&per_page=100`, {
        headers: { 'Authorization': `Basic ${auth}` },
      });
      const children = await childRes.json();
      bundled_names = children.map((c: { id: number; name: string }) => `${c.id}: ${c.name}`);
    }

    return {
      id: b.id,
      name: b.name,
      status: b.status,
      price: b.price,
      woosb_ids: woosb_ids,
      bundled_names,
      after_text,
    };
  }));

  return new Response(JSON.stringify(summary, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
