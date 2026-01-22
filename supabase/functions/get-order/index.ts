import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get('order_id');
    const orderToken = url.searchParams.get('token');

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!orderToken) {
      return new Response(
        JSON.stringify({ error: 'Order token is required for verification' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate token format (64 hex characters)
    if (!/^[a-f0-9]{64}$/i.test(orderToken)) {
      return new Response(
        JSON.stringify({ error: 'Invalid token format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch order by woocommerce_order_id AND verify the token matches
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, order_number, status, customer_name, line_items, subtotal, shipping_total, tax_total, total, currency, created_at, order_token')
      .eq('woocommerce_order_id', orderId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching order:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch order' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Verify the token matches using constant-time comparison to prevent timing attacks
    const tokenMatch = order.order_token && 
      order.order_token.length === orderToken.length &&
      timingSafeCompare(order.order_token, orderToken);

    if (!tokenMatch) {
      console.warn('Invalid order token attempt for order:', orderId);
      return new Response(
        JSON.stringify({ error: 'Invalid order token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Return sanitized order data (no sensitive info like email/addresses/token)
    const sanitizedOrder = {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      customer_name: order.customer_name,
      line_items: order.line_items,
      subtotal: order.subtotal,
      shipping_total: order.shipping_total,
      tax_total: order.tax_total,
      total: order.total,
      currency: order.currency,
      created_at: order.created_at,
    };

    return new Response(
      JSON.stringify({ order: sanitizedOrder }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Constant-time string comparison to prevent timing attacks
function timingSafeCompare(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  
  if (aBytes.length !== bBytes.length) {
    return false;
  }
  
  // Use XOR to compare all bytes without early exit
  let result = 0;
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i];
  }
  
  return result === 0;
}