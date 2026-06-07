import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? '')

const FROM = process.env.SENDGRID_FROM_EMAIL ?? 'no-reply@tiesverse.com'

export async function sendRegistrationConfirmation(params: {
  to: string
  toName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  venueType: string
  locationText: string | null
  meetingUrl: string | null
  ticketId: string
}) {
  if (!process.env.SENDGRID_API_KEY) return

  const locationLine =
    params.venueType === 'ONLINE'
      ? params.meetingUrl
        ? `Join online: ${params.meetingUrl}`
        : 'Online event — meeting link will be shared soon.'
      : params.locationText ?? 'Venue details will be shared soon.'

  const msg = {
    to: { email: params.to, name: params.toName },
    from: FROM,
    subject: `You're registered: ${params.eventTitle}`,
    text: [
      `Hi ${params.toName},`,
      ``,
      `You're officially registered for ${params.eventTitle}.`,
      ``,
      `📅 Date: ${params.eventDate}`,
      `⏰ Time: ${params.eventTime}`,
      `📍 ${locationLine}`,
      ``,
      `Your ticket ID: ${params.ticketId}`,
      ``,
      `See you there!`,
      `— Tiesverse Team`,
    ].join('\n'),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Registration Confirmed</title></head>
<body style="font-family:sans-serif;background:#09090b;color:#f0f0f4;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#141417;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#1e1a10,#141417);padding:32px 40px;border-bottom:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;font-size:12px;letter-spacing:0.1em;color:#e4d5a0;text-transform:uppercase;">Tiesverse</p>
            <h1 style="margin:8px 0 0;font-size:22px;font-weight:600;color:#f0f0f4;">You're registered!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 24px;color:#a1a1aa;">Hi ${params.toName},<br>Your spot is confirmed for:</p>
            <h2 style="margin:0 0 24px;font-size:18px;font-weight:600;color:#f0f0f4;">${params.eventTitle}</h2>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 14px;background:rgba(255,255,255,0.04);border-radius:8px;margin-bottom:8px;display:block;">
                  <span style="font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Date</span><br>
                  <span style="color:#f0f0f4;font-weight:500;">${params.eventDate}</span>
                </td>
              </tr>
              <tr><td height="8"></td></tr>
              <tr>
                <td style="padding:10px 14px;background:rgba(255,255,255,0.04);border-radius:8px;">
                  <span style="font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Time</span><br>
                  <span style="color:#f0f0f4;font-weight:500;">${params.eventTime}</span>
                </td>
              </tr>
              <tr><td height="8"></td></tr>
              <tr>
                <td style="padding:10px 14px;background:rgba(255,255,255,0.04);border-radius:8px;">
                  <span style="font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Location</span><br>
                  <span style="color:#f0f0f4;font-weight:500;">${locationLine}</span>
                </td>
              </tr>
            </table>

            <div style="margin:28px 0;padding:16px;background:rgba(228,213,160,0.06);border:1px solid rgba(228,213,160,0.2);border-radius:10px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;color:#e4d5a0;text-transform:uppercase;letter-spacing:0.08em;">Your Ticket</p>
              <p style="margin:0;font-size:20px;font-weight:700;letter-spacing:0.15em;color:#e4d5a0;">${params.ticketId}</p>
            </div>

            <p style="margin:0;font-size:13px;color:#71717a;">Questions? Reply to this email.<br>— Tiesverse Team</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }

  try {
    await sgMail.send(msg)
  } catch (err) {
    console.error('[email] failed to send registration confirmation:', err)
  }
}
