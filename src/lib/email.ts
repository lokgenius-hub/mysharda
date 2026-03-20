/**
 * Send email notification to admin when a new enquiry comes in.
 * Uses Resend free tier (100 emails/day) — no credit card needed.
 * Falls back silently if not configured (enquiry still saved).
 */

const RESEND_API_URL = 'https://api.resend.com/emails'

interface EnquiryData {
  name: string
  phone: string
  email?: string | null
  enquiry_type: string
  message?: string | null
  preferred_date?: string | null
  guests?: number | null
}

export async function sendEnquiryEmail(enquiry: EnquiryData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_EMAIL

  if (!apiKey || !adminEmail) {
    console.log('[Email] Skipping — RESEND_API_KEY or ADMIN_EMAIL not configured')
    return false
  }

  try {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: var(--bg-deep); color: #fff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, var(--primary), var(--primary-dark)); padding: 20px 24px;">
          <h2 style="margin: 0; color: var(--bg-deep); font-size: 20px;">🔔 New Enquiry — ${process.env.NEXT_PUBLIC_HOTEL_NAME || 'Hotel'}</h2>
        </div>
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: var(--primary); width: 120px; vertical-align: top;">Name</td>
              <td style="padding: 8px 0; color: #fff;">${enquiry.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: var(--primary); vertical-align: top;">Phone</td>
              <td style="padding: 8px 0; color: #fff;">
                <a href="tel:+91${enquiry.phone}" style="color: var(--primary); text-decoration: none;">+91 ${enquiry.phone}</a>
              </td>
            </tr>
            ${enquiry.email ? `<tr><td style="padding: 8px 0; color: var(--primary); vertical-align: top;">Email</td><td style="padding: 8px 0; color: #fff;">${enquiry.email}</td></tr>` : ''}
            <tr>
              <td style="padding: 8px 0; color: var(--primary); vertical-align: top;">Type</td>
              <td style="padding: 8px 0; color: #fff; text-transform: capitalize;">${enquiry.enquiry_type}</td>
            </tr>
            ${enquiry.preferred_date ? `<tr><td style="padding: 8px 0; color: var(--primary); vertical-align: top;">Date</td><td style="padding: 8px 0; color: #fff;">${enquiry.preferred_date}</td></tr>` : ''}
            ${enquiry.guests ? `<tr><td style="padding: 8px 0; color: var(--primary); vertical-align: top;">Guests</td><td style="padding: 8px 0; color: #fff;">${enquiry.guests}</td></tr>` : ''}
            ${enquiry.message ? `<tr><td style="padding: 8px 0; color: var(--primary); vertical-align: top;">Message</td><td style="padding: 8px 0; color: #fff;">${enquiry.message}</td></tr>` : ''}
          </table>
          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
            <a href="https://wa.me/91${enquiry.phone}?text=Hi%20${encodeURIComponent(enquiry.name)}%2C%20thank%20you%20for%20contacting%20${encodeURIComponent(process.env.NEXT_PUBLIC_HOTEL_NAME || 'us')}!" 
               style="display: inline-block; padding: 10px 20px; background: #25D366; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 8px;">
              💬 WhatsApp
            </a>
            <a href="tel:+91${enquiry.phone}" 
               style="display: inline-block; padding: 10px 20px; background: var(--primary); color: var(--bg-deep); text-decoration: none; border-radius: 8px; font-weight: bold;">
              📞 Call
            </a>
          </div>
        </div>
        <div style="padding: 12px 24px; background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.3); text-align: center; font-size: 12px;">
          ${process.env.NEXT_PUBLIC_HOTEL_NAME || 'Hotel'} Admin Notification
        </div>
      </div>
    `

    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${process.env.NEXT_PUBLIC_HOTEL_NAME || 'Hotel'} <onboarding@resend.dev>`,
        to: adminEmail,
        subject: `🔔 New ${enquiry.enquiry_type} enquiry from ${enquiry.name}`,
        html: htmlBody,
      }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      console.error('[Email] Resend error:', errData)
      return false
    }

    console.log('[Email] Notification sent to', adminEmail)
    return true
  } catch (err) {
    console.error('[Email] Failed to send:', err)
    return false
  }
}
