import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const cartToken = url.searchParams.get('cart_token');

    if (!cartToken || cartToken.length > 64 || !/^[a-f0-9-]+$/i.test(cartToken)) {
      return new Response(
        JSON.stringify({ cleared: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('orders')
      .select('status')
      .eq('cart_token', cartToken)
      .maybeSingle();

    if (error) {
      console.error('Error checking cart status:', error.message);
      return new Response(
        JSON.stringify({ cleared: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Clear cart if order exists (any status means checkout was completed)
    const cleared = !!data;

    return new Response(
      JSON.stringify({ cleared }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('check-cart-status error:', error);
    return new Response(
      JSON.stringify({ cleared: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
