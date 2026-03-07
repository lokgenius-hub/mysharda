// Supabase Edge Function: notify-enquiry
// Triggered by a Database Webhook when a new row is inserted into the enquiries table.
// Sends email notification to admin via SMTP (Gmail) — no third-party API key needed.
//
// HOW TO DEPLOY:
// 1. Install Supabase CLI: npm install -g supabase
// 2. Login: supabase login
// 3. Link project: supabase link --project-ref ydgriludptadkoqkkuwt
// 4. Deploy: supabase functions deploy notify-enquiry
// 5. Set secrets:
//      supabase secrets set SMTP_USER=bhabuasavvy@gmail.com
//      supabase secrets set SMTP_PASS=xxxx xxxx xxxx xxxx    (Gmail App Password — 16 chars)
//      supabase secrets set ADMIN_EMAIL=bhabuasavvy@gmail.com
//
// HOW TO CREATE GMAIL APP PASSWORD (one-time):
// 1. Go to https://myaccount.google.com/security
// 2. Turn on 2-Step Verification (if not already on)
// 3. Go to https://myaccount.google.com/apppasswords
// 4. App: "Mail", Device: "Other" → name it "Sharda Palace"
// 5. Google gives you a 16-character password like "abcd efgh ijkl mnop"
// 6. Use that as SMTP_PASS (remove spaces or keep them — both work)
//
// HOW TO SET UP WEBHOOK (in Supabase Dashboard):
// 1. Go to Database → Webhooks
// 2. Create new webhook:
//    - Name: notify-enquiry
//    - Table: enquiries
//    - Events: INSERT
//    - Type: Supabase Edge Functions
//    - Edge Function: notify-enquiry

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'

serve(async (req) => {
  try {
    const payload = await req.json()

    // Supabase webhook sends: { type: "INSERT", table: "enquiries", record: {...}, ... }
    const enquiry = payload.record
    if (!enquiry) {
      return new Response('No record in payload', { status: 400 })
    }

    const smtpUser  = Deno.env.get('SMTP_USER')    // e.g. bhabuasavvy@gmail.com
    const smtpPass  = Deno.env.get('SMTP_PASS')     // Gmail App Password (16 chars)
    const adminEmail = Deno.env.get('ADMIN_EMAIL')   // where notifications go
    const smtpHost  = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com'
    const smtpPort  = parseInt(Deno.env.get('SMTP_PORT') || '465')

    if (!smtpUser || !smtpPass || !adminEmail) {
      console.log('Skipping email — SMTP_USER, SMTP_PASS, or ADMIN_EMAIL not set')
      return new Response('OK (no SMTP config)', { status: 200 })
    }

    const hotelWhatsApp = Deno.env.get('HOTEL_WHATSAPP') || '917303584266'

    // ── Build beautiful HTML email ──
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #fff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #c9a84c, #a88a3a); padding: 20px 24px;">
          <h2 style="margin: 0; color: #0f0f23; font-size: 20px;">🔔 New Enquiry — Sharda Palace</h2>
          <p style="margin: 4px 0 0; color: rgba(0,0,0,0.6); font-size: 13px;">Received on ${new Date(enquiry.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        </div>
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #c9a84c; width: 120px; vertical-align: top; font-size: 14px;">Name</td>
              <td style="padding: 8px 0; color: #fff; font-size: 14px; font-weight: bold;">${enquiry.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #c9a84c; vertical-align: top; font-size: 14px;">Phone</td>
              <td style="padding: 8px 0; font-size: 14px;">
                <a href="tel:+91${enquiry.phone}" style="color: #c9a84c; text-decoration: none; font-weight: bold;">+91 ${enquiry.phone}</a>
              </td>
            </tr>
            ${enquiry.email ? `<tr><td style="padding: 8px 0; color: #c9a84c; vertical-align: top; font-size: 14px;">Email</td><td style="padding: 8px 0; color: #fff; font-size: 14px;">${enquiry.email}</td></tr>` : ''}
            <tr>
              <td style="padding: 8px 0; color: #c9a84c; vertical-align: top; font-size: 14px;">Type</td>
              <td style="padding: 8px 0; color: #fff; font-size: 14px; text-transform: capitalize;">${enquiry.enquiry_type}</td>
            </tr>
            ${enquiry.preferred_date ? `<tr><td style="padding: 8px 0; color: #c9a84c; vertical-align: top; font-size: 14px;">Date</td><td style="padding: 8px 0; color: #fff; font-size: 14px;">${enquiry.preferred_date}</td></tr>` : ''}
            ${enquiry.guests ? `<tr><td style="padding: 8px 0; color: #c9a84c; vertical-align: top; font-size: 14px;">Guests</td><td style="padding: 8px 0; color: #fff; font-size: 14px;">${enquiry.guests} people</td></tr>` : ''}
            ${enquiry.message ? `<tr><td style="padding: 8px 0; color: #c9a84c; vertical-align: top; font-size: 14px;">Message</td><td style="padding: 8px 0; color: rgba(255,255,255,0.7); font-size: 14px; font-style: italic;">"${enquiry.message}"</td></tr>` : ''}
          </table>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0 0 12px;">Quick actions:</p>
            <a href="https://wa.me/${hotelWhatsApp}?text=${encodeURIComponent(`Hi ${enquiry.name}, thank you for contacting Sharda Palace! We received your ${enquiry.enquiry_type} enquiry. Our team will assist you shortly. 🙏`)}"
               style="display: inline-block; padding: 10px 20px; background: #25D366; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 8px; font-size: 14px;">
              💬 Reply on WhatsApp
            </a>
            <a href="tel:+91${enquiry.phone}"
               style="display: inline-block; padding: 10px 20px; background: #c9a84c; color: #0f0f23; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
              📞 Call Now
            </a>
          </div>
        </div>
        <div style="padding: 12px 24px; background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.3); text-align: center; font-size: 11px;">
          Sharda Palace Admin Notification • Auto-triggered by Supabase
        </div>
      </div>
    `

    // ── Send via SMTP (Gmail) ──
    const client = new SmtpClient()
    await client.connectTLS({
      hostname: smtpHost,
      port: smtpPort,
      username: smtpUser,
      password: smtpPass,
    })

    await client.send({
      from: smtpUser,
      to: adminEmail,
      subject: `🔔 New ${enquiry.enquiry_type} enquiry from ${enquiry.name}`,
      content: `New ${enquiry.enquiry_type} enquiry from ${enquiry.name} (${enquiry.phone})`,
      html: htmlBody,
    })

    await client.close()

    console.log(`SMTP email sent to ${adminEmail} for enquiry from ${enquiry.name}`)
    return new Response('OK', { status: 200 })

  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(`Error: ${String(err)}`, { status: 500 })
  }
})
