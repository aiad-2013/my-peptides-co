import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STORE_URL = 'https://checkout.mypeptideco.com';

interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
  meta?: Record<string, unknown>;
}

async function requireAdmin(req: Request): Promise<{ ok: true; userId: string } | { ok: false; status: number; msg: string }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return { ok: false, status: 401, msg: 'Missing auth' };

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: userRes, error } = await supabase.auth.getUser();
  if (error || !userRes.user) return { ok: false, status: 401, msg: 'Invalid session' };

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const { data: roleRow } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', userRes.user.id)
    .eq('role', 'admin')
    .maybeSingle();
  if (!roleRow) return { ok: false, status: 403, msg: 'Not an admin' };
  return { ok: true, userId: userRes.user.id };
}

async function checkSecrets(): Promise<CheckResult> {
  const required = ['WOOCOMMERCE_CONSUMER_KEY', 'WOOCOMMERCE_CONSUMER_SECRET', 'WOOCOMMERCE_WEBHOOK_SECRET', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = required.filter(k => !Deno.env.get(k));
  return {
    name: 'Secrets configured',
    ok: missing.length === 0,
    detail: missing.length === 0 ? `${required.length} required secrets present` : `Missing: ${missing.join(', ')}`,
  };
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
    const products = await res.json();
    return {
      name: 'WooCommerce API',
      ok: true,
      detail: `Reachable in ${ms}ms — sample product: ${products?.[0]?.name ?? 'n/a'}`,
      meta: { latency_ms: ms },
    };
  } catch (e) {
    return { name: 'WooCommerce API', ok: false, detail: `Fetch failed: ${e instanceof Error ? e.message : e}` };
  }
}

async function checkWebhookEndpoint(): Promise<CheckResult> {
  const secret = Deno.env.get('WOOCOMMERCE_WEBHOOK_SECRET');
  if (!secret) return { name: 'Webhook signature flow', ok: false, detail: 'WOOCOMMERCE_WEBHOOK_SECRET missing' };

  // Build a signed product.updated payload with a non-existent id so it's a no-op
  const body = JSON.stringify({ id: 0, _diagnostic: true });
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  const url = `${Deno.env.get('SUPABASE_URL')}/functions/v1/woocommerce-webhook`;

  const t0 = Date.now();
  const validRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': Deno.env.get('SUPABASE_ANON_KEY')!,
      'x-wc-webhook-topic': 'product.updated',
      'x-wc-webhook-signature': sigB64,
    },
    body,
  });
  const validJson = await validRes.json().catch(() => ({}));
  const validMs = Date.now() - t0;

  // Send invalid signature; should also 200 but with ignored:invalid_signature
  const invalidRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': Deno.env.get('SUPABASE_ANON_KEY')!,
      'x-wc-webhook-topic': 'product.updated',
      'x-wc-webhook-signature': 'BAD_SIG',
    },
    body,
  });
  const invalidJson = await invalidRes.json().catch(() => ({}));

  const validOk = validRes.status === 200 && !validJson?.ignored;
  const invalidRejected = invalidJson?.ignored === 'invalid_signature';
  const ok = validOk && invalidRejected;
  return {
    name: 'Webhook signature flow',
    ok,
    detail: ok
      ? `Signed payload accepted (${validMs}ms); invalid signature correctly rejected`
      : `valid=${JSON.stringify(validJson)} invalid=${JSON.stringify(invalidJson)}`,
  };
}

async function checkCache(): Promise<CheckResult> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const { count, error } = await supabase
    .from('products_cache')
    .select('*', { count: 'exact', head: true });
  if (error) return { name: 'Product cache', ok: false, detail: error.message };

  const { data: inv } = await supabase
    .from('cache_invalidations')
    .select('updated_at')
    .eq('id', 'products')
    .maybeSingle();

  const { data: latest } = await supabase
    .from('products_cache')
    .select('synced_at')
    .order('synced_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastSync = latest?.synced_at ? new Date(latest.synced_at as string) : null;
  const ageHours = lastSync ? (Date.now() - lastSync.getTime()) / 3_600_000 : Infinity;
  const fresh = ageHours < 26; // daily cron runs at 17:00 UTC

  return {
    name: 'Product cache',
    ok: (count ?? 0) > 0 && fresh,
    detail: `${count ?? 0} products cached. Last sync: ${lastSync ? `${ageHours.toFixed(1)}h ago` : 'never'}. Last invalidation: ${inv?.updated_at ?? 'n/a'}`,
    meta: { count, last_sync: latest?.synced_at, last_invalidation: inv?.updated_at },
  };
}

async function triggerSync(opts: { full?: boolean; wooCommerceId?: number; slug?: string }) {
  const url = `${Deno.env.get('SUPABASE_URL')}/functions/v1/sync-products`;
  const t0 = Date.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
    },
    body: JSON.stringify(opts),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ms: Date.now() - t0, body: json };
}

const FALLBACK_TO = 'nadia+mpc@aiad.com.au';
const ALERT_FROM_EMAIL = 'alerts@mypeptideco.com';
const ALERT_FROM_NAME = 'mypeptideco alerts';
const SENDGRID_URL = 'https://api.sendgrid.com/v3/mail/send';

async function sendConfirmationEmail(checks: CheckResult[], userId: string) {
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
  if (!SENDGRID_API_KEY) {
    console.error('[admin-diagnostics] Missing SENDGRID_API_KEY');
    return { ok: false, reason: 'missing_credentials' };
  }
  const failures = checks.filter(c => !c.ok);
  const allOk = failures.length === 0;
  const statusLabel = allOk ? 'All checks passed' : `${failures.length} check${failures.length > 1 ? 's' : ''} failed`;
  const headerColor = allOk ? '#19A899' : '#b91c1c';
  const rows = checks.map(c => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-family:'Space Grotesk',sans-serif;font-size:14px;color:#1a1a1a;font-weight:600;width:40%;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c.ok ? '#19A899' : '#b91c1c'};margin-right:8px;vertical-align:middle;"></span>${c.name}
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-family:'Space Grotesk',sans-serif;font-size:13px;color:#55575d;">${c.detail}</td>
    </tr>`).join('');
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:600px;">
          <tr><td style="background:${headerColor};padding:24px 32px;">
            <h1 style="margin:0;font-family:'Poppins',Arial,sans-serif;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">mypeptideco · Manual Health Check</h1>
          </td></tr>
          <tr><td style="padding:32px;">
            <p style="margin:0 0 8px;font-family:'Poppins',Arial,sans-serif;font-size:18px;font-weight:600;color:#1a1a1a;">${statusLabel}</p>
            <p style="margin:0 0 24px;font-family:'Space Grotesk',Arial,sans-serif;font-size:14px;color:#55575d;line-height:1.5;">A diagnostic run was triggered manually from the admin dashboard. Full results below.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-collapse:collapse;">${rows}</table>
            <p style="margin:24px 0 0;font-family:'Space Grotesk',Arial,sans-serif;font-size:13px;color:#55575d;">Run timestamp (UTC): ${new Date().toISOString()}<br/>Triggered by user: ${userId}</p>
          </td></tr>
          <tr><td style="background:#1a1a1a;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-family:'Space Grotesk',Arial,sans-serif;font-size:12px;color:#999999;">Manual run confirmation · mypeptideco.com</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
  const subject = allOk
    ? '[mypeptideco] Manual health check — all checks passed'
    : `[mypeptideco] Manual health check — ${failures.length} issue${failures.length > 1 ? 's' : ''}`;
  const to = (Deno.env.get('DIAGNOSTICS_TO') ?? FALLBACK_TO).trim() || FALLBACK_TO;
  const ccRaw = Deno.env.get('DIAGNOSTICS_BCC') ?? '';
  const cc = ccRaw.split(',').map(s => s.trim()).filter(Boolean);
  const meta = { to, cc_count: cc.length, provider: 'sendgrid' };

  const personalization: Record<string, unknown> = { to: [{ email: to }] };
  if (cc.length > 0) personalization.cc = cc.map(email => ({ email }));

  const payload = {
    personalizations: [personalization],
    from: { email: ALERT_FROM_EMAIL, name: ALERT_FROM_NAME },
    subject,
    content: [{ type: 'text/html', value: html }],
  };

  const res = await fetch(SENDGRID_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SENDGRID_API_KEY}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error(`[admin-diagnostics] SendGrid send failed [${res.status}]:`, errText);
    return { ok: false, status: res.status, error: errText, meta };
  }
  const messageId = res.headers.get('x-message-id');
  console.log('[admin-diagnostics] Confirmation email sent', messageId);
  return { ok: true, id: messageId, meta };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: auth.msg }), {
      status: auth.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: { action?: string; wooCommerceId?: number; slug?: string } = {};
  try { body = await req.json(); } catch { /* default */ }
  const action = body.action ?? 'health';

  try {
    if (action === 'health') {
      const [secrets, woo, webhook, cache] = await Promise.all([
        checkSecrets(), checkWooApi(), checkWebhookEndpoint(), checkCache(),
      ]);
      const checks = [secrets, woo, webhook, cache];
      const email = await sendConfirmationEmail(checks, auth.userId).catch((e) => {
        console.error('[admin-diagnostics] email error', e);
        return { ok: false, reason: e instanceof Error ? e.message : 'unknown_error' };
      });
      return new Response(JSON.stringify({ checks, email }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (action === 'sync-full') {
      const result = await triggerSync({ full: true });
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (action === 'sync-one') {
      if (!body.wooCommerceId && !body.slug) {
        return new Response(JSON.stringify({ error: 'wooCommerceId or slug required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const result = await triggerSync({ wooCommerceId: body.wooCommerceId, slug: body.slug });
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
