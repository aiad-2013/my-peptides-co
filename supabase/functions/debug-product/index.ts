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
  const headers = { 'Authorization': `Basic ${auth}` };

  // Fetch raw product 350 (Growth MK677)
  const res = await fetch('https://vicorpus.co/wp-json/wc/v3/products/350', { headers });
  const product = await res.json();

  return new Response(JSON.stringify({
    id: product.id,
    name: product.name,
    type: product.type,
    meta_data: product.meta_data,
  }, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
