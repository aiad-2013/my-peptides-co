import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STORE_URL = 'https://checkout.mypeptideco.com';
const FALLBACK_TO = 'nadia+resend@aiad.com.au';
const ALERT_FROM = 'mypeptideco alerts <onboarding@resend.dev>';
const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

interface CheckResult { name: string; ok: boolean; detail: string; }

async function checkSecrets(): Promise<CheckResult> {
  const required = ['WOOCOMMERCE_CONSUMER_KEY', 'WOOCOMMERCE_CONSUMER_SECRET', 'WOOCOMMERCE_WEBHOOK_SECRET', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY', 'LOVABLE_API_KEY'];
  const missing = required.filter(k => !Deno.env.get(k));
  return { name: 'Secrets configured', ok: missing.length === 0, detail: missing.length === 0 ? `${required.length} required secrets present` : `Missing: ${missing.join(', ')}` };
}

async function checkWooApi(): Promise<CheckResult> {
  const ck = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY');
  const cs = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET');
  if (!ck || !cs) return { name: 'WooCommerce API', ok: false, detail: 'Credentials missing' };
  const t0 = Date.now();
  try {
    const res = await fetch(`${STORE_URL}/wp-json/wc/v3/products?per_page=1&status=publish`, {
      headers: { 'Authorization': `Basic ${btoa(`${ck}:${cs}`)}` },
    });
    const ms = Date.now() - t0;
    if (!res.ok) return { name: 'WooCommerce API', ok: false, detail: `HTTP ${res.status} (${ms}ms)` };
    return { name: 'WooCommerce API', ok: true, detail: `Reachable in ${ms}ms` };
  } catch (e) {
    return { name: 'WooCommerce API', ok: false, detail: `Fetch failed: ${e instanceof Error ? e.message : e}` };
  }
}

async function checkWebhookEndpoint(): Promise<CheckResult> {
  const secret = Deno.env.get('WOOCOMMERCE_WEBHOOK_SECRET');
  if (!secret) return { name: 'Webhook signature flow', ok: false, detail: 'WOOCOMMERCE_WEBHOOK_SECRET missing' };
  const body = JSON.stringify({ id: 0, _diagnostic: true });
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  const url = `${Deno.env.get('SUPABASE_URL')}/functions/v1/woocommerce-webhook`;
  const validRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': Deno.env.get('SUPABASE_ANON_KEY')!, 'x-wc-webhook-topic': 'product.updated', 'x-wc-webhook-signature': sigB64 },
    body,
  });
  const validJson = await validRes.json().catch(() => ({}));
  const invalidRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': Deno.env.get('SUPABASE_ANON_KEY')!, 'x-wc-webhook-topic': 'product.updated', 'x-wc-webhook-signature': 'BAD_SIG' },
    body,
  });
  const invalidJson = await invalidRes.json().catch(() => ({}));
  const ok = validRes.status === 200 && !validJson?.ignored && invalidJson?.ignored === 'invalid_signature';
  return { name: 'Webhook signature flow', ok, detail: ok ? 'Signed payload accepted; invalid rejected' : `valid=${JSON.stringify(validJson)} invalid=${JSON.stringify(invalidJson)}` };
}

async function checkCache(): Promise<CheckResult> {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { count, error } = await supabase.from('products_cache').select('*', { count: 'exact', head: true });
  if (error) return { name: 'Product cache', ok: false, detail: error.message };
  const { data: latest } = await supabase.from('products_cache').select('synced_at').order('synced_at', { ascending: false }).limit(1).maybeSingle();
  const lastSync = latest?.synced_at ? new Date(latest.synced_at as string) : null;
  const ageHours = lastSync ? (Date.now() - lastSync.getTime()) / 3_600_000 : Infinity;
  const fresh = ageHours < 26;
  return { name: 'Product cache', ok: (count ?? 0) > 0 && fresh, detail: `${count ?? 0} products. Last sync: ${lastSync ? `${ageHours.toFixed(1)}h ago` : 'never'}` };
}

async function sendDailyEmail(checks: CheckResult[]) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
    console.error('[health-check] Cannot send email: missing email credentials');
    return;
  }
  const failures = checks.filter(c => !c.ok);
  const hasFailures = failures.length > 0;
  const headerBg = hasFailures ? '#dc2626' : '#19A899';
  const statusLabel = hasFailures ? `${failures.length} CHECK${failures.length > 1 ? 'S' : ''} FAILED` : 'ALL SYSTEMS OPERATIONAL';
  const statusBlurb = hasFailures
    ? 'The daily diagnostic run detected issues. Failed checks are highlighted in red below.'
    : 'The daily diagnostic run completed successfully. All systems are healthy.';

  const rows = checks.map(c => {
    const rowBg = c.ok ? '#ffffff' : '#fef2f2';
    const labelColor = c.ok ? '#1a1a1a' : '#b91c1c';
    const detailColor = c.ok ? '#55575d' : '#b91c1c';
    const badgeBg = c.ok ? '#19A899' : '#dc2626';
    const badgeText = c.ok ? 'PASS' : 'FAIL';
    return `
    <tr style="background:${rowBg};">
      <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;font-family:'Space Grotesk',sans-serif;font-size:14px;color:${labelColor};font-weight:700;width:40%;">${c.name}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;font-family:'Space Grotesk',sans-serif;font-size:13px;color:${detailColor};">${c.detail}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;text-align:right;"><span style="display:inline-block;background:${badgeBg};color:#ffffff;font-family:'Poppins',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.05em;padding:4px 10px;border-radius:3px;">${badgeText}</span></td>
    </tr>`;
  }).join('');

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
      <tr><td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:640px;">
          <tr><td style="background:${headerBg};padding:24px 32px;">
            <p style="margin:0 0 4px;font-family:'Space Grotesk',Arial,sans-serif;font-size:12px;font-weight:600;color:#ffffff;letter-spacing:0.1em;text-transform:uppercase;opacity:0.85;">Daily Health Check</p>
            <h1 style="margin:0;font-family:'Poppins',Arial,sans-serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">${statusLabel}</h1>
          </td></tr>
          <tr><td style="padding:28px 32px 8px;">
            <p style="margin:0 0 20px;font-family:'Space Grotesk',Arial,sans-serif;font-size:14px;color:#55575d;line-height:1.5;">${statusBlurb}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-collapse:collapse;">${rows}</table>
            <p style="margin:20px 0 0;font-family:'Space Grotesk',Arial,sans-serif;font-size:12px;color:#55575d;">Run timestamp (UTC): ${new Date().toISOString()}</p>
            <p style="margin:16px 0 24px;"><a href="https://mypeptideco.com/admin" style="display:inline-block;background:#19A899;color:#ffffff;text-decoration:none;padding:12px 20px;font-family:'Poppins',Arial,sans-serif;font-size:14px;font-weight:600;">Open Admin Diagnostics</a></p>
          </td></tr>
          <tr><td style="background:#1a1a1a;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-family:'Space Grotesk',Arial,sans-serif;font-size:12px;color:#999999;">Automated daily report · mypeptideco.com</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;

  const subject = hasFailures
    ? `🚨 [mypeptideco] Health check FAILED — ${failures.length} issue${failures.length > 1 ? 's' : ''}`
    : `✅ [mypeptideco] Daily health check — All systems OK`;

  const bccRaw = Deno.env.get('DIAGNOSTICS_BCC') ?? '';
  const bcc = bccRaw.split(',').map(s => s.trim()).filter(Boolean);
  const to = (Deno.env.get('DIAGNOSTICS_TO') ?? FALLBACK_TO).trim() || FALLBACK_TO;
  const payload: Record<string, unknown> = { from: ALERT_FROM, to: [to], subject, html };
  if (bcc.length > 0) payload.bcc = bcc;
  const res = await fetch(`${GATEWAY_URL}/emails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'X-Connection-Api-Key': RESEND_API_KEY },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) console.error(`[health-check] Resend send failed [${res.status}]:`, JSON.stringify(data));
  else console.log('[health-check] Daily email sent', data?.id);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const [secrets, woo, webhook, cache] = await Promise.all([checkSecrets(), checkWooApi(), checkWebhookEndpoint(), checkCache()]);
    const checks = [secrets, woo, webhook, cache];
    const failures = checks.filter(c => !c.ok);
    console.log(`[health-check] ${failures.length} failures of ${checks.length} checks`);
    await sendDailyEmail(checks);
    return new Response(JSON.stringify({ ok: failures.length === 0, checks, emailed: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[health-check] Fatal error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
