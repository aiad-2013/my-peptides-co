import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STORE_URL = 'https://checkout.mypeptideco.com';
const FALLBACK_TO = 'nadia+mpc@aiad.com.au';
const ALERT_FROM_EMAIL = 'alerts@mypeptideco.com';
const ALERT_FROM_NAME = 'My Peptide Co Diagnostics';
const SENDGRID_URL = 'https://api.sendgrid.com/v3/mail/send';

interface CheckResult { name: string; ok: boolean; detail: string; }

async function checkSecrets(): Promise<CheckResult> {
  const required = ['WOOCOMMERCE_CONSUMER_KEY', 'WOOCOMMERCE_CONSUMER_SECRET', 'WOOCOMMERCE_WEBHOOK_SECRET', 'SUPABASE_SERVICE_ROLE_KEY', 'SENDGRID_API_KEY'];
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

async function checkWebhookDeliveries(): Promise<CheckResult> {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const since = new Date(Date.now() - 24 * 3_600_000).toISOString();
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('updated_at', since);
  if (error) return { name: 'WooCommerce webhook deliveries (24h)', ok: false, detail: error.message };
  const { data: latest } = await supabase
    .from('orders')
    .select('updated_at')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const lastAt = latest?.updated_at ? new Date(latest.updated_at as string) : null;
  const ageHours = lastAt ? (Date.now() - lastAt.getTime()) / 3_600_000 : Infinity;
  const n = count ?? 0;
  // OK if we've received at least one webhook in the last 24h, OR latest delivery is within 72h
  // (low-volume days shouldn't trigger a false alarm).
  const ok = n > 0 || ageHours < 72;
  return {
    name: 'WooCommerce webhook deliveries (24h)',
    ok,
    detail: lastAt
      ? `${n} order webhook${n === 1 ? '' : 's'} received. Last delivery: ${ageHours.toFixed(1)}h ago.`
      : `${n} order webhooks received. No deliveries on record.`,
  };
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


async function sendDailyEmail(checks: CheckResult[]): Promise<{ ok: boolean; messageId: string | null }> {
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
  if (!SENDGRID_API_KEY) {
    console.error('[health-check] Cannot send email: missing SENDGRID_API_KEY');
    return { ok: false, messageId: null };
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
    ? `🚨 My Peptide Co health check FAILED — ${failures.length} issue${failures.length > 1 ? 's' : ''}`
    : `✅ My Peptide Co health check — All systems OK`;

  const ccRaw = Deno.env.get('DIAGNOSTICS_CC') ?? '';
  const cc = ccRaw.split(',').map(s => s.trim()).filter(Boolean);
  const to = (Deno.env.get('DIAGNOSTICS_TO') ?? FALLBACK_TO).trim() || FALLBACK_TO;
  const personalization: Record<string, unknown> = { to: [{ email: to }] };
  if (cc.length > 0) personalization.cc = cc.map(email => ({ email }));
  const payload = {
    personalizations: [personalization],
    from: { email: ALERT_FROM_EMAIL, name: ALERT_FROM_NAME },
    subject,
    content: [{ type: 'text/html', value: html }],
  };
  // Retry SendGrid up to 3 times with exponential backoff for transient failures.
  const MAX_ATTEMPTS = 3;
  let lastErr = '';
  let messageId: string | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(SENDGRID_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SENDGRID_API_KEY}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        messageId = res.headers.get('x-message-id');
        console.log(`[health-check] Daily email sent on attempt ${attempt}`, messageId);
        return { ok: true, messageId };
      }
      lastErr = `HTTP ${res.status}: ${await res.text().catch(() => '')}`;
      console.error(`[health-check] SendGrid attempt ${attempt} failed:`, lastErr);
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
      console.error(`[health-check] SendGrid attempt ${attempt} threw:`, lastErr);
    }
    if (attempt < MAX_ATTEMPTS) {
      await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }
  console.error(`[health-check] All ${MAX_ATTEMPTS} SendGrid attempts failed. Last error:`, lastErr);
  return { ok: false, messageId: null };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const force = url.searchParams.get('force') === 'true';
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const today = new Date().toISOString().slice(0, 10);

    // Skip if today's email already sent (unless force=true)
    if (!force) {
      const { data: existing } = await supabase
        .from('diagnostics_email_log')
        .select('run_date, sent_at')
        .eq('run_date', today)
        .maybeSingle();
      if (existing) {
        console.log(`[health-check] Email for ${today} already sent at ${existing.sent_at}; skipping.`);
        return new Response(JSON.stringify({ ok: true, skipped: true, reason: 'already_sent_today', sent_at: existing.sent_at }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const [secrets, woo, webhook, cache] = await Promise.all([checkSecrets(), checkWooApi(), checkWebhookEndpoint(), checkCache()]);
    const checks = [secrets, woo, webhook, cache];
    const failures = checks.filter(c => !c.ok);
    console.log(`[health-check] ${failures.length} failures of ${checks.length} checks`);
    const sendResult = await sendDailyEmail(checks);

    if (sendResult.ok) {
      const { error: logErr } = await supabase
        .from('diagnostics_email_log')
        .insert({ run_date: today, failures_count: failures.length, message_id: sendResult.messageId });
      if (logErr && !logErr.message?.includes('duplicate')) {
        console.error('[health-check] Failed to log send:', logErr.message);
      }
    }

    return new Response(JSON.stringify({ ok: failures.length === 0, checks, emailed: sendResult.ok }), {
      status: sendResult.ok ? 200 : 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[health-check] Fatal error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
