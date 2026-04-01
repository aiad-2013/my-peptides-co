import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-wc-webhook-signature, x-wc-webhook-topic',
};

// Zod schema for WooCommerce order validation
const BillingSchema = z.object({
  first_name: z.string().max(100).default(''),
  last_name: z.string().max(100).default(''),
  email: z.string().email().max(255).optional().or(z.literal('')),
  phone: z.string().max(50).default(''),
  address_1: z.string().max(500).default(''),
  address_2: z.string().max(500).default(''),
  city: z.string().max(100).default(''),
  state: z.string().max(100).default(''),
  postcode: z.string().max(20).default(''),
  country: z.string().max(10).default(''),
}).passthrough();

const ShippingSchema = z.object({
  first_name: z.string().max(100).default(''),
  last_name: z.string().max(100).default(''),
  address_1: z.string().max(500).default(''),
  address_2: z.string().max(500).default(''),
  city: z.string().max(100).default(''),
  state: z.string().max(100).default(''),
  postcode: z.string().max(20).default(''),
  country: z.string().max(10).default(''),
}).passthrough();

const LineItemSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  quantity: z.number().int().min(0),
  price: z.number(),
  total: z.string(),
  sku: z.string().max(100).optional().default(''),
}).passthrough();

const WooCommerceOrderSchema = z.object({
  id: z.number().positive(),
  number: z.string().max(50),
  status: z.string().max(50),
  currency: z.string().max(10),
  total: z.string(),
  subtotal: z.string(),
  shipping_total: z.string(),
  total_tax: z.string(),
  payment_method: z.string().max(100).optional().default(''),
  payment_method_title: z.string().max(200).optional().default(''),
  customer_note: z.string().max(2000).optional().default(''),
  billing: BillingSchema.optional(),
  shipping: ShippingSchema.optional(),
  line_items: z.array(LineItemSchema).default([]),
}).passthrough();

type WooCommerceOrder = z.infer<typeof WooCommerceOrderSchema>;

// Sanitize string to prevent XSS and injection attacks
function sanitizeString(str: string | undefined | null, maxLength: number): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/[<>"'\\]/g, '') // Remove potentially dangerous characters
    .substring(0, maxLength);
}

// Sanitize address objects for safe storage
function sanitizeAddress(address: z.infer<typeof BillingSchema> | z.infer<typeof ShippingSchema> | undefined): Record<string, string> | null {
  if (!address) return null;
  return {
    first_name: sanitizeString(address.first_name, 100),
    last_name: sanitizeString(address.last_name, 100),
    address_1: sanitizeString(address.address_1, 500),
    address_2: sanitizeString(address.address_2, 500),
    city: sanitizeString(address.city, 100),
    state: sanitizeString(address.state, 100),
    postcode: sanitizeString(address.postcode, 20),
    country: sanitizeString(address.country, 10),
  };
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

// Generate a deterministic order token using HMAC-SHA256
async function generateOrderToken(orderId: string, secret: string): Promise<string> {
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
    encoder.encode(orderId)
  );
  return Array.from(new Uint8Array(signatureBytes), byte => 
    byte.toString(16).padStart(2, '0')
  ).join('');
}

// Parse monetary value safely
function parseMonetaryValue(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  const parsed = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(parsed) || parsed < 0 || parsed > 999999999) return 0;
  return parsed;
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
      console.log('Received ping/verification request');
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
          JSON.stringify({ error: 'Unauthorized' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      const isValid = await verifyWebhookSignature(rawBody, webhookSignature, webhookSecret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      console.log('Webhook signature verified successfully');
    } else {
      console.warn('WOOCOMMERCE_WEBHOOK_SECRET not configured - skipping signature verification');
    }
    
    console.log('Received WooCommerce webhook:', webhookTopic);

    // Handle product webhooks — bump the cache invalidation timestamp so the frontend refetches
    if (
      webhookTopic === 'product.updated' ||
      webhookTopic === 'product.created' ||
      webhookTopic === 'product.deleted' ||
      webhookTopic === 'product.restored'
    ) {
      const { error: ciError } = await supabase
        .from('cache_invalidations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', 'products');

      if (ciError) {
        console.error('Error updating cache invalidation:', ciError.message);
      } else {
        console.log('Product cache invalidated for topic:', webhookTopic);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Product cache invalidated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Only process order events below this point
    if (webhookTopic !== 'order.created' && webhookTopic !== 'order.updated' && webhookTopic !== 'order.completed') {
      return new Response(
        JSON.stringify({ message: 'Webhook topic not handled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Parse and validate the order data
    let orderData: WooCommerceOrder;
    try {
      const parsedJson = JSON.parse(rawBody);
      orderData = WooCommerceOrderSchema.parse(parsedJson);
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error('Validation error:', err.errors);
        return new Response(
          JSON.stringify({ error: 'Invalid order data format' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      console.error('JSON parse error:', err);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Generate deterministic token using HMAC
    if (!webhookSecret) {
      console.error('WOOCOMMERCE_WEBHOOK_SECRET required for token generation');
      return new Response(
        JSON.stringify({ error: 'Configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    const orderToken = await generateOrderToken(orderData.id.toString(), webhookSecret);

    // Prepare sanitized order data for storage
    const customerEmail = orderData.billing?.email && orderData.billing.email !== '' 
      ? sanitizeString(orderData.billing.email, 255) 
      : null;
    
    const customerName = orderData.billing 
      ? sanitizeString(`${orderData.billing.first_name} ${orderData.billing.last_name}`, 255)
      : null;

    // Sanitize line items
    const sanitizedLineItems = orderData.line_items.map(item => ({
      id: item.id,
      name: sanitizeString(item.name, 500),
      quantity: Math.max(0, Math.min(item.quantity, 9999)),
      price: parseMonetaryValue(item.price),
      total: parseMonetaryValue(item.total).toString(),
      sku: sanitizeString(item.sku, 100),
    }));

    // Extract cart_token from WooCommerce order meta_data if present
    const rawJson = JSON.parse(rawBody);
    let cartToken: string | null = null;
    if (Array.isArray(rawJson.meta_data)) {
      const meta = rawJson.meta_data.find((m: { key: string; value: string }) => m.key === '_lovable_cart_token');
      if (meta && typeof meta.value === 'string' && meta.value.length <= 64) {
        cartToken = meta.value;
      }
    }

    const orderRecord = {
      woocommerce_order_id: orderData.id.toString(),
      order_number: sanitizeString(orderData.number, 50),
      status: sanitizeString(orderData.status, 50),
      customer_email: customerEmail,
      customer_name: customerName,
      billing_address: sanitizeAddress(orderData.billing),
      shipping_address: sanitizeAddress(orderData.shipping),
      line_items: sanitizedLineItems,
      subtotal: parseMonetaryValue(orderData.subtotal),
      shipping_total: parseMonetaryValue(orderData.shipping_total),
      tax_total: parseMonetaryValue(orderData.total_tax),
      total: parseMonetaryValue(orderData.total),
      currency: sanitizeString(orderData.currency, 10),
      payment_method: sanitizeString(orderData.payment_method_title || orderData.payment_method, 200),
      order_notes: sanitizeString(orderData.customer_note, 2000),
      order_token: orderToken,
      ...(cartToken ? { cart_token: cartToken } : {}),
    };

    // Upsert the order (insert or update if exists)
    const { data, error } = await supabase
      .from('orders')
      .upsert(orderRecord, { onConflict: 'woocommerce_order_id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving order:', error.code);
      return new Response(
        JSON.stringify({ error: 'Failed to save order' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Order saved successfully:', data.id);

    return new Response(
      JSON.stringify({ success: true, order_id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Webhook error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
