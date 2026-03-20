// Supabase Edge Function: notify-enquiry
// Triggered by Supabase Database Webhook on enquiries INSERT.
// Sends email via Gmail SMTP (denomailer). Per-tenant smtp_user/smtp_pass
// are stored in site_config DB — admin sets them in Admin → Notifications.
//
// ── SUPABASE SECRETS (global fallback if DB fields are blank) ────────────────
//   supabase secrets set SMTP_USER=yourgmail@gmail.com
//   supabase secrets set SMTP_PASS=xxxx-xxxx-xxxx-xxxx   (Gmail App Password)
//   supabase secrets set ADMIN_EMAIL=fallback@gmail.com
//   supabase secrets set SUPABASE_URL=https://xxx.supabase.co
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
//
// ── PER-TENANT (Admin → Site Configuration → Notifications) ─────────────────
//   notify_email  = hotel@gmail.com        ← where alert emails are sent
//   smtp_user     = sender@gmail.com       ← Gmail account (FROM address)
//   smtp_pass     = xxxx xxxx xxxx xxxx    ← Gmail App Password (16 chars)
//
// ── HOW TO GET GMAIL APP PASSWORD ───────────────────────────────────────────
//   1. Google Account → Security → 2-Step Verification → ON
//   2. Search "App passwords" → Select app: Mail → Generate
//   3. Copy the 16-char password shown
//
// ── DEPLOY ───────────────────────────────────────────────────────────────────
//   supabase functions deploy notify-enquiry

import { serve }      from 'https://deno.land/std@0.168.0/http/server.ts'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

// ── Fetch hotel config from site_config KV table ─────────────────────────────
async function getHotelConfig(tenantId: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  const defaults = {
    site_name:       'Hotel',
    notify_email:    Deno.env.get('ADMIN_EMAIL') || '',
    whatsapp_number: Deno.env.get('DEFAULT_WHATSAPP') || '',
    phone:           '',
    smtp_user:       '',
    smtp_pass:       '',
    primary_color:   '#c9a84c',   // gold fallback (Sharda default)
    bg_color:        '#0f0f23',
  }

  if (!supabaseUrl || !serviceKey) return defaults

  try {
    const url = `${supabaseUrl}/rest/v1/site_config?select=config_key,config_value` +
                `&tenant_id=eq.${encodeURIComponent(tenantId)}` +
                `&config_key=in.(hotel_name,phone,email,whatsapp,notify_email,smtp_user,smtp_pass,primary_color,bg_color)`
    const res  = await fetch(url, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    })
    const rows = await res.json()
    if (!Array.isArray(rows) || rows.length === 0) return defaults

    const kv: Record<string, string> = {}
    for (const row of rows) kv[row.config_key] = row.config_value

    return {
      site_name:       kv['hotel_name']    || defaults.site_name,
      notify_email:    kv['notify_email']  || kv['email'] || defaults.notify_email,
      whatsapp_number: kv['whatsapp']      || kv['phone'] || defaults.whatsapp_number,
      phone:           kv['phone']         || defaults.phone,
      smtp_user:       kv['smtp_user']     || '',
      smtp_pass:       kv['smtp_pass']     || '',
      primary_color:   kv['primary_color'] || defaults.primary_color,
      bg_color:        kv['bg_color']      || defaults.bg_color,
    }
  } catch {
    return defaults
  }
}

serve(async (req) => {
  try {
    const payload = await req.json()
    const enquiry  = payload.record
    if (!enquiry) return new Response('No record in payload', { status: 400 })

    const tenantId    = enquiry.tenant_id || Deno.env.get('DEFAULT_TENANT_ID') || 'sharda'
    const hotelConfig = await getHotelConfig(tenantId)

    // Per-tenant SMTP first, then fall back to global Supabase secrets
    const smtpUser   = hotelConfig.smtp_user || Deno.env.get('SMTP_USER') || ''
    const smtpPass   = hotelConfig.smtp_pass || Deno.env.get('SMTP_PASS') || ''
    const adminEmail = hotelConfig.notify_email
    const smtpHost   = 'smtp.gmail.com'
    const smtpPort   = 465

    if (!smtpUser || !smtpPass || !adminEmail) {
      console.log(`[${hotelConfig.site_name}] Skipping — SMTP or notify_email not configured`)
      return new Response('OK (no SMTP config)', { status: 200 })
    }

    const hotelName     = hotelConfig.site_name
    const hotelWhatsApp = hotelConfig.whatsapp_number
    const PRIMARY       = hotelConfig.primary_color   // e.g. #c9a84c or #e63946
    const BG            = hotelConfig.bg_color        // e.g. #0f0f23 or #1a0808

    const receivedAt = enquiry.created_at
      ? new Date(enquiry.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })

    const waMsg = encodeURIComponent(
      `Hi ${enquiry.name}, thank you for contacting ${hotelName}! ` +
      `We received your ${enquiry.enquiry_type || 'general'} enquiry. Our team will assist you shortly. 🙏`
    )

    const htmlBody = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:24px auto;background:${BG};color:#fff;border-radius:12px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,${PRIMARY},${PRIMARY}cc);padding:20px 24px;">
      <h2 style="margin:0;color:${BG};font-size:20px;">🔔 New Enquiry — ${hotelName}</h2>
      <p style="margin:6px 0 0;color:rgba(0,0,0,0.55);font-size:13px;">Received ${receivedAt}</p>
    </div>
    <div style="padding:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:${PRIMARY};width:110px;vertical-align:top;font-size:14px;font-weight:bold;">Name</td>
          <td style="padding:8px 0;color:#fff;font-size:15px;font-weight:bold;">${enquiry.name}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:${PRIMARY};vertical-align:top;font-size:14px;font-weight:bold;">Phone</td>
          <td style="padding:8px 0;font-size:14px;">
            <a href="tel:+91${enquiry.phone}" style="color:${PRIMARY};text-decoration:none;font-weight:bold;">+91 ${enquiry.phone}</a>
          </td>
        </tr>
        ${enquiry.email ? `<tr><td style="padding:8px 0;color:${PRIMARY};vertical-align:top;font-size:14px;font-weight:bold;">Email</td><td style="padding:8px 0;color:#fff;font-size:14px;">${enquiry.email}</td></tr>` : ''}
        <tr>
          <td style="padding:8px 0;color:${PRIMARY};vertical-align:top;font-size:14px;font-weight:bold;">Type</td>
          <td style="padding:8px 0;color:#fff;font-size:14px;text-transform:capitalize;">${enquiry.enquiry_type || 'general'}</td>
        </tr>
        ${enquiry.preferred_date ? `<tr><td style="padding:8px 0;color:${PRIMARY};vertical-align:top;font-size:14px;font-weight:bold;">Date</td><td style="padding:8px 0;color:#fff;font-size:14px;">${enquiry.preferred_date}</td></tr>` : ''}
        ${enquiry.guests ? `<tr><td style="padding:8px 0;color:${PRIMARY};vertical-align:top;font-size:14px;font-weight:bold;">Guests</td><td style="padding:8px 0;color:#fff;font-size:14px;">${enquiry.guests} people</td></tr>` : ''}
        ${enquiry.message ? `<tr><td style="padding:8px 0;color:${PRIMARY};vertical-align:top;font-size:14px;font-weight:bold;">Message</td><td style="padding:8px 0;color:rgba(255,255,255,0.7);font-size:14px;font-style:italic;">"${enquiry.message}"</td></tr>` : ''}
      </table>
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
        <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0 0 12px;">Quick reply:</p>
        <a href="https://wa.me/${hotelWhatsApp}?text=${waMsg}"
           style="display:inline-block;padding:10px 20px;background:#25D366;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;margin-right:8px;font-size:14px;">
          💬 WhatsApp
        </a>
        <a href="tel:+91${enquiry.phone}"
           style="display:inline-block;padding:10px 20px;background:${PRIMARY};color:${BG};text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;">
          📞 Call Now
        </a>
      </div>
    </div>
    <div style="padding:12px 24px;background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.25);text-align:center;font-size:11px;">
      ${hotelName} Admin Notification • Auto-triggered by Supabase
    </div>
  </div>
</body>
</html>`

    // ── Customer confirmation email (only if customer provided their email) ──
    const customerEmail = enquiry.email?.trim() || ''
    const customerHtml = customerEmail ? `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:24px auto;background:${BG};color:#fff;border-radius:12px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,${PRIMARY},${PRIMARY}cc);padding:24px;">
      <h2 style="margin:0;color:${BG};font-size:22px;">Thank you, ${enquiry.name}! 🙏</h2>
      <p style="margin:8px 0 0;color:rgba(0,0,0,0.6);font-size:14px;">We've received your enquiry</p>
    </div>
    <div style="padding:28px 24px;">
      <p style="color:rgba(255,255,255,0.85);font-size:15px;line-height:1.6;margin:0 0 20px;">
        Thank you for reaching out to <strong style="color:${PRIMARY};">${hotelName}</strong>.<br>
        Our team will get back to you within <strong>2 hours</strong>.
      </p>

      <div style="background:rgba(255,255,255,0.04);border:1px solid ${PRIMARY}26;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
        <p style="color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">Your Enquiry Summary</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:5px 0;color:rgba(255,255,255,0.45);font-size:13px;width:100px;">Type</td>
            <td style="padding:5px 0;color:#fff;font-size:13px;text-transform:capitalize;">${enquiry.enquiry_type || 'General'}</td>
          </tr>
          ${enquiry.preferred_date ? `<tr><td style="padding:5px 0;color:rgba(255,255,255,0.45);font-size:13px;">Preferred Date</td><td style="padding:5px 0;color:#fff;font-size:13px;">${enquiry.preferred_date}</td></tr>` : ''}
          ${enquiry.guests ? `<tr><td style="padding:5px 0;color:rgba(255,255,255,0.45);font-size:13px;">Guests</td><td style="padding:5px 0;color:#fff;font-size:13px;">${enquiry.guests} people</td></tr>` : ''}
          ${enquiry.message ? `<tr><td style="padding:5px 0;color:rgba(255,255,255,0.45);font-size:13px;vertical-align:top;">Message</td><td style="padding:5px 0;color:rgba(255,255,255,0.7);font-size:13px;font-style:italic;">"${enquiry.message}"</td></tr>` : ''}
        </table>
      </div>

      <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 16px;">Need immediate assistance? Reach us directly:</p>
      <a href="tel:+91${hotelConfig.phone}"
         style="display:inline-block;padding:10px 22px;background:${PRIMARY};color:${BG};text-decoration:none;border-radius:8px;font-weight:bold;margin-right:8px;font-size:14px;">
        📞 Call Us
      </a>
      <a href="https://wa.me/${hotelWhatsApp}?text=Hi%2C%20I%20just%20submitted%20an%20enquiry%20and%20need%20help."
         style="display:inline-block;padding:10px 22px;background:#25D366;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;">
        💬 WhatsApp
      </a>
    </div>
    <div style="padding:14px 24px;background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.25);text-align:center;font-size:11px;">
      ${hotelName} • This is an automated confirmation. Please do not reply to this email.
    </div>
  </div>
</body>
</html>` : ''

    const client = new SMTPClient({
      connection: { hostname: smtpHost, port: smtpPort, tls: true,
        auth: { username: smtpUser, password: smtpPass } },
    })

    // 1️⃣ Admin notification
    await client.send({
      from:    smtpUser,
      to:      adminEmail,
      subject: `🔔 [${hotelName}] New ${enquiry.enquiry_type || 'general'} enquiry from ${enquiry.name}`,
      content: `New enquiry from ${enquiry.name} (${enquiry.phone})`,
      html:    htmlBody,
    })
    console.log(`[${hotelName}] Admin email sent → ${adminEmail}`)

    // 2️⃣ Customer confirmation (only if they provided an email)
    if (customerEmail && customerHtml) {
      await client.send({
        from:    smtpUser,
        to:      customerEmail,
        subject: `✅ We received your enquiry — ${hotelName}`,
        content: `Thank you ${enquiry.name}, we'll get back to you within 2 hours.`,
        html:    customerHtml,
      })
      console.log(`[${hotelName}] Customer confirmation sent → ${customerEmail}`)
    }

    await client.close()
    return new Response('OK', { status: 200 })

  } catch (err) {
    console.error('notify-enquiry error:', err)
    return new Response(`Error: ${String(err)}`, { status: 500 })
  }
})
