import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface CartItem {
  wooCommerceId: number;
  quantity: number;
  name: string;
  price: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const consumerKey = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET');

    if (!consumerKey || !consumerSecret) {
      throw new Error('WooCommerce API credentials not configured');
    }

    const { items, billing, shipping }: { items: CartItem[]; billing?: Record<string, string>; shipping?: Record<string, string> } = await req.json();

    if (!items || items.length === 0) {
      throw new Error('No items in cart');
    }

    const storeUrl = 'https://vicorpus.co';
    const auth = btoa(`${consumerKey}:${consumerSecret}`);

    // Create a pending order with line items and optional customer details
    const orderPayload: Record<string, unknown> = {
      status: 'pending',
      set_paid: false,
      line_items: items.map((item) => ({
        product_id: item.wooCommerceId,
        quantity: item.quantity,
      })),
    };

    if (billing) orderPayload.billing = billing;
    if (shipping) orderPayload.shipping = shipping;

    console.log('Creating WooCommerce order:', JSON.stringify(orderPayload));

    const response = await fetch(`${storeUrl}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WooCommerce order creation error:', response.status, errorText);
      throw new Error(`WooCommerce API error: ${response.status}`);
    }

    const order = await response.json();
    console.log('Order created:', order.id, 'key:', order.order_key);

    // Build the pay-for-order URL - shows payment form on WooCommerce
    const payUrl = `${storeUrl}/checkout/order-pay/${order.id}/?pay_for_order=true&key=${order.order_key}`;

    return new Response(JSON.stringify({ payUrl, orderId: order.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating order:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
