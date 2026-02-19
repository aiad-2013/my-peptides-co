const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
      );
    }

    const { order_number, email } = await req.json();

    if (!order_number || typeof order_number !== 'string' || order_number.trim().length === 0 || order_number.trim().length > 20) {
      return new Response(
        JSON.stringify({ error: 'Valid order number is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 255) {
      return new Response(
        JSON.stringify({ error: 'Valid email address is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const consumerKey = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET');

    if (!consumerKey || !consumerSecret) {
      console.error('WooCommerce credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Service unavailable' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 }
      );
    }

    const storeUrl = 'https://vicorpus.co';
    const sanitizedOrderNumber = order_number.trim();
    const sanitizedEmail = email.trim().toLowerCase();

    // Search WooCommerce orders by order number
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const searchUrl = `${storeUrl}/wp-json/wc/v3/orders?search=${encodeURIComponent(sanitizedOrderNumber)}&per_page=5`;

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('WooCommerce API error:', response.status);
      return new Response(
        JSON.stringify({ error: 'Failed to look up order' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
      );
    }

    const orders = await response.json();

    // Find the order matching both order number and email
    const matchedOrder = orders.find((o: any) =>
      String(o.number) === sanitizedOrderNumber &&
      o.billing?.email?.toLowerCase() === sanitizedEmail
    );

    if (!matchedOrder) {
      return new Response(
        JSON.stringify({ error: 'No order found matching that order number and email address.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Return sanitized order data (no sensitive PII beyond what customer already knows)
    const sanitizedOrder = {
      order_number: String(matchedOrder.number),
      status: matchedOrder.status,
      customer_name: `${matchedOrder.billing?.first_name || ''} ${matchedOrder.billing?.last_name || ''}`.trim(),
      line_items: (matchedOrder.line_items || []).map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        total: item.total,
      })),
      subtotal: matchedOrder.line_items?.reduce((sum: number, item: any) => sum + parseFloat(item.total || '0'), 0) || 0,
      shipping_total: parseFloat(matchedOrder.shipping_total || '0'),
      tax_total: parseFloat(matchedOrder.total_tax || '0'),
      total: parseFloat(matchedOrder.total || '0'),
      currency: matchedOrder.currency || 'AUD',
      created_at: matchedOrder.date_created,
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
