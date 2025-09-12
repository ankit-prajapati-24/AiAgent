export const contactUsTemplate = (name, message, userDomain) => {
    return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial, Helvetica, sans-serif; background:#f4f6f8; padding:24px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="padding:20px 28px; text-align:left; background:linear-gradient(90deg,#0ea5a4,#60a5fa); color:#ffffff;">
            <h1 style="margin:0; font-size:20px; line-height:1.1;">Contact Us – We Got Your Message!</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:24px 28px; color:#0f172a;">
            <p style="margin:0 0 12px 0; font-size:15px;">
              Hi <strong>${name}</strong>,
            </p>

            <p style="margin:0 0 12px 0; font-size:15px;">
              Thanks for reaching out! We’ve received your message and our team will review it shortly.
            </p>

            <hr style="border:none; border-top:1px solid #e6e9ee; margin:18px 0;">

            <p style="margin:0 0 8px 0; font-size:14px; color:#475569;">
              <strong>Your message:</strong>
            </p>
            <blockquote style="margin:8px 0 16px 0; padding:12px 14px; background:#f8fafc; border-left:4px solid #c7d2fe; color:#0f172a;">
              ${message}
            </blockquote>

            
            <p style="margin:12px 0 0 0;">
              <a href="${userDomain}" style="display:inline-block; padding:10px 16px; border-radius:6px; background:#10b981; color:#ffffff; font-size:14px; text-decoration:none;">Visit Our Website</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`
}
