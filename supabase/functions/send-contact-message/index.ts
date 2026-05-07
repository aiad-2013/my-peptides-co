import { corsHeaders } from '@supabase/supabase-js/cors';
import { z } from 'npm:zod@3.23.8';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const TO_EMAIL = 'info@mypeptideco.com';
const FROM_EMAIL = 'alerts@mypeptideco.com';
const FROM_NAME = 'My Peptide Co Contact Form';

const BodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(150).optional().default(''),
  message: z.string().trim().min(1).max(2000),
});

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!SENDGRID_API_KEY) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { name, email, subject, message } = parsed.data;
    const finalSubject = subject?.trim()
      ? `[Contact Form] ${subject}`
      : `[Contact Form] New enquiry from ${name}`;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 600px;">
        <h2 style="color: #19A899; margin-bottom: 16px;">New contact form submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        ${subject ? `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>` : ''}
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        <p style="white-space: pre-wrap; line-height: 1.5;">${escapeHtml(message)}</p>
      </div>
    `;

    const text = `New contact form submission\n\nName: ${name}\nEmail: ${email}\n${subject ? `Subject: ${subject}\n` : ''}\n${message}`;

    const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: TO_EMAIL }] }],
        from: { email: FROM_EMAIL, name: FROM_NAME },
        reply_to: { email, name },
        subject: finalSubject,
        content: [
          { type: 'text/plain', value: text },
          { type: 'text/html', value: html },
        ],
      }),
    });

    if (!sgRes.ok) {
      const errBody = await sgRes.text();
      console.error('SendGrid error', sgRes.status, errBody);
      return new Response(JSON.stringify({ error: 'Failed to send message' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('send-contact-message error', e);
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
