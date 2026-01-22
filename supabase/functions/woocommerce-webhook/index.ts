import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-wc-webhook-signature, x-wc-webhook-topic',
};

interface WooCommerceOrder {
  id: number;
  number: string;
  status: string;
  currency: string;
  total: string;
  subtotal: string;
  shipping_total: string;
  total_tax: string;
  payment_method: string;
  payment_method_title: string;
  customer_note: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  line_items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    total: string;
    sku: string;
  }>;
}

// Verify WooCommerce webhook signature using HMAC-SHA256
async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(body)
    );
    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
    return expectedSignature === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Generate a secure random token for order verification
function generateOrderToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const webhookSecret = Deno.env.get('WOOCOMMERCE_WEBHOOK_SECRET');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get webhook headers
    const webhookTopic = req.headers.get('x-wc-webhook-topic');
    const webhookSignature = req.headers.get('x-wc-webhook-signature');
    const contentType = req.headers.get('content-type') || '';
    
    // Read the raw body for signature verification
    const rawBody = await req.text();
    
    // Handle WooCommerce ping/verification request (sent as form data)
    if (!webhookTopic || contentType.includes('application/x-www-form-urlencoded')) {
      console.log('Received ping/verification request:', rawBody);
      return new Response(
        JSON.stringify({ success: true, message: 'Webhook verified' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Verify webhook signature for actual order webhooks
    if (webhookSecret) {
      if (!webhookSignature) {
        console.error('Missing webhook signature');
        return new Response(
          JSON.stringify({ error: 'Missing webhook signature' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      const isValid = await verifyWebhookSignature(rawBody, webhookSignature, webhookSecret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid webhook signature' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      console.log('Webhook signature verified successfully');
    } else {
      console.warn('WOOCOMMERCE_WEBHOOK_SECRET not configured - skipping signature verification');
    }
    
    // Parse the order data from the raw body
    const orderData: WooCommerceOrder = JSON.parse(rawBody);
    
    console.log('Received WooCommerce webhook:', webhookTopic, 'Order ID:', orderData.id);

    // Only process order.created and order.updated events
    if (webhookTopic !== 'order.created' && webhookTopic !== 'order.updated' && webhookTopic !== 'order.completed') {
      return new Response(
        JSON.stringify({ message: 'Webhook topic not handled', topic: webhookTopic }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Check if this order already exists (to preserve existing token on updates)
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('order_token')
      .eq('woocommerce_order_id', orderData.id.toString())
      .maybeSingle();

    // Generate a new token only for new orders, preserve existing token for updates
    const orderToken = existingOrder?.order_token || generateOrderToken();

    // Prepare order data for storage
    const orderRecord = {
      woocommerce_order_id: orderData.id.toString(),
      order_number: orderData.number,
      status: orderData.status,
      customer_email: orderData.billing?.email,
      customer_name: orderData.billing ? `${orderData.billing.first_name} ${orderData.billing.last_name}`.trim() : null,
      billing_address: orderData.billing,
      shipping_address: orderData.shipping,
      line_items: orderData.line_items,
      subtotal: parseFloat(orderData.subtotal) || 0,
      shipping_total: parseFloat(orderData.shipping_total) || 0,
      tax_total: parseFloat(orderData.total_tax) || 0,
      total: parseFloat(orderData.total) || 0,
      currency: orderData.currency,
      payment_method: orderData.payment_method_title || orderData.payment_method,
      order_notes: orderData.customer_note,
      order_token: orderToken,
    };

    // Upsert the order (insert or update if exists)
    const { data, error } = await supabase
      .from('orders')
      .upsert(orderRecord, { onConflict: 'woocommerce_order_id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving order:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save order', details: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Order saved successfully:', data.id);

    return new Response(
      JSON.stringify({ success: true, order_id: data.id, woocommerce_order_id: orderData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
