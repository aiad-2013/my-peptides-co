import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Fetch all products from cache
    let { data: rows, error } = await supabase
      .from('products_cache')
      .select('data, synced_at');

    if (error) throw new Error(`Cache read failed: ${error.message}`);

    // Auto-backfill if cache is empty (first deploy / fresh restore)
    if (!rows || rows.length === 0) {
      console.log('[get-products] Cache empty — triggering backfill from WooCommerce');
      const syncUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/sync-products`;
      const res = await fetch(syncUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({ full: true }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Backfill failed: ${res.status} ${txt}`);
      }
      console.log('[get-products] Backfill complete, re-reading cache');
      const reread = await supabase.from('products_cache').select('data, synced_at');
      rows = reread.data || [];
    }

    const products = (rows || []).map(r => r.data);
    console.log(`[get-products] Returning ${products.length} cached products`);

    return new Response(JSON.stringify({ products }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[get-products] Error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
