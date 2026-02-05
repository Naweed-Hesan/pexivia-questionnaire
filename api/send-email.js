import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Build the HTML email for Naweed
    const ownerEmailHtml = buildOwnerEmail(data);

    // Build the confirmation email for the client
    const clientEmailHtml = buildClientEmail(data);

    // Send email to Naweed
    const ownerEmail = await resend.emails.send({
      from: 'Pexivia <noreply@send.pexivia.com>',
      to: 'naweedhesan@gmail.com',
      subject: data.isCustomQuote
        ? `Custom Quote Request from ${data.fullName || 'New Lead'}`
        : `New Project Inquiry from ${data.fullName || 'New Lead'}`,
      html: ownerEmailHtml,
    });

    // Send confirmation email to client (if they provided an email)
    if (data.email) {
      await resend.emails.send({
        from: 'Naweed Hesan <noreply@send.pexivia.com>',
        to: data.email,
        subject: 'Thank you for your inquiry - Pexivia',
        html: clientEmailHtml,
      });
    }

    return res.status(200).json({ success: true, id: ownerEmail.data?.id });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}

function buildOwnerEmail(data) {
  const services = data.services || [];
  const styles = data.styles || [];
  const colors = data.colors || [];
  const typography = data.typography || [];
  const packages = data.packages || [];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #191919; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #191919; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #232323; border-radius: 16px; overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color: #f68700; padding: 32px 40px;">
              <h1 style="margin: 0; color: #191919; font-size: 24px; font-weight: 700;">
                ${data.isCustomQuote ? 'Custom Quote Request' : 'New Project Inquiry'}
              </h1>
              <p style="margin: 8px 0 0 0; color: #191919; opacity: 0.8; font-size: 14px;">
                Submitted on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </td>
          </tr>

          <!-- Contact Info -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #f68700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Contact Information</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #8a8a8a; font-size: 13px;">Name</span><br>
                    <span style="color: #ffffff; font-size: 16px; font-weight: 500;">${data.fullName || 'Not provided'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #8a8a8a; font-size: 13px;">Company</span><br>
                    <span style="color: #ffffff; font-size: 16px; font-weight: 500;">${data.company || 'Not provided'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #8a8a8a; font-size: 13px;">Email</span><br>
                    <a href="mailto:${data.email}" style="color: #f68700; font-size: 16px; font-weight: 500; text-decoration: none;">${data.email || 'Not provided'}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #8a8a8a; font-size: 13px;">Phone</span><br>
                    <a href="tel:${data.phone}" style="color: #f68700; font-size: 16px; font-weight: 500; text-decoration: none;">${data.phone || 'Not provided'}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Services & Project -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #f68700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Project Details</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #8a8a8a; font-size: 13px;">Services Interested In</span><br>
                    <span style="color: #ffffff; font-size: 16px; font-weight: 500;">${services.length > 0 ? services.join(', ') : 'None selected'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #8a8a8a; font-size: 13px;">Industry</span><br>
                    <span style="color: #ffffff; font-size: 16px; font-weight: 500;">${data.industry || 'Not provided'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #8a8a8a; font-size: 13px;">Target Audience</span><br>
                    <span style="color: #ffffff; font-size: 16px; font-weight: 500;">${data.targetAudience || 'Not provided'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #8a8a8a; font-size: 13px;">Project Description</span><br>
                    <span style="color: #ffffff; font-size: 15px; line-height: 1.6;">${data.projectDescription || 'Not provided'}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Design Preferences -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #f68700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Design Preferences</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #8a8a8a; font-size: 13px;">Style Preferences</span><br>
                    <span style="color: #ffffff; font-size: 16px; font-weight: 500;">${styles.length > 0 ? styles.join(', ') : 'None selected'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #8a8a8a; font-size: 13px;">Color Direction</span><br>
                    <span style="color: #ffffff; font-size: 16px; font-weight: 500;">${colors.length > 0 ? colors.join(', ') : 'None selected'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #8a8a8a; font-size: 13px;">Specific Colors</span><br>
                    <span style="color: #ffffff; font-size: 16px; font-weight: 500;">${data.specificColors || 'Not provided'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #8a8a8a; font-size: 13px;">Typography</span><br>
                    <span style="color: #ffffff; font-size: 16px; font-weight: 500;">${typography.length > 0 ? typography.join(', ') : 'None selected'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #8a8a8a; font-size: 13px;">References / Inspiration</span><br>
                    <span style="color: #ffffff; font-size: 15px; line-height: 1.6;">${data.references || 'Not provided'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #8a8a8a; font-size: 13px;">Things to Avoid</span><br>
                    <span style="color: #ffffff; font-size: 16px; font-weight: 500;">${data.thingsToAvoid || 'Not provided'}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Budget & Timeline -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #f68700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Budget & Timeline</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #8a8a8a; font-size: 13px;">Timeline</span><br>
                    <span style="color: #ffffff; font-size: 16px; font-weight: 500;">${data.timelineLabel || 'Not selected'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #8a8a8a; font-size: 13px;">Budget Range</span><br>
                    <span style="color: #ffffff; font-size: 16px; font-weight: 500;">${data.budgetLabel || 'Not selected'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #8a8a8a; font-size: 13px;">Existing Brand Assets</span><br>
                    <span style="color: #ffffff; font-size: 16px; font-weight: 500;">${data.existingAssetsLabel || 'Not selected'}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Packages Selected -->
          ${packages.length > 0 ? `
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #f68700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Packages Selected</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #191919; border-radius: 8px; overflow: hidden;">
                ${packages.map(pkg => `
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #ffffff; font-size: 16px; font-weight: 600;">${pkg.service}</span>
                    <span style="color: #8a8a8a; font-size: 14px;"> - ${pkg.tier}</span>
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #2e2e2e; text-align: right;">
                    <span style="color: #f68700; font-size: 18px; font-weight: 700;">$${pkg.price.toLocaleString()}</span>
                  </td>
                </tr>
                `).join('')}
                <tr>
                  <td style="padding: 20px; font-size: 18px; font-weight: 600; color: #ffffff;">
                    Estimated Total
                  </td>
                  <td style="padding: 20px; text-align: right;">
                    <span style="color: #f68700; font-size: 24px; font-weight: 700;">$${data.totalPrice?.toLocaleString() || '0'}</span>
                  </td>
                </tr>
              </table>
              ${data.multiplierNote ? `<p style="margin: 12px 0 0 0; color: #8a8a8a; font-size: 12px;">${data.multiplierNote}</p>` : ''}
            </td>
          </tr>
          ` : ''}

          <!-- Additional Info -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #f68700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Additional Information</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2e2e2e;">
                    <span style="color: #8a8a8a; font-size: 13px;">Additional Notes</span><br>
                    <span style="color: #ffffff; font-size: 15px; line-height: 1.6;">${data.additionalNotes || 'None'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #8a8a8a; font-size: 13px;">Referral Source</span><br>
                    <span style="color: #ffffff; font-size: 16px; font-weight: 500;">${data.referralSourceLabel || 'Not selected'}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #191919; padding: 24px 40px; text-align: center;">
              <p style="margin: 0; color: #8a8a8a; font-size: 13px;">
                This inquiry was submitted via pexivia.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function buildClientEmail(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #191919; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #191919; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #232323; border-radius: 16px; overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color: #f68700; padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #191919; font-size: 28px; font-weight: 700;">
                Thank You!
              </h1>
              <p style="margin: 12px 0 0 0; color: #191919; opacity: 0.8; font-size: 16px;">
                Your inquiry has been received
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              <p style="margin: 0 0 24px 0; color: #ffffff; font-size: 18px; line-height: 1.6;">
                Hi ${data.fullName || 'there'},
              </p>
              <p style="margin: 0 0 24px 0; color: #b5b5b5; font-size: 16px; line-height: 1.7;">
                Thank you for reaching out about your project! I've received your ${data.isCustomQuote ? 'custom quote request' : 'project inquiry'} and I'm excited to learn more about what you're looking to create.
              </p>
              <p style="margin: 0 0 24px 0; color: #b5b5b5; font-size: 16px; line-height: 1.7;">
                I'll review the details you've shared and get back to you within <strong style="color: #ffffff;">24-48 hours</strong> with next steps.
              </p>
              <p style="margin: 0 0 32px 0; color: #b5b5b5; font-size: 16px; line-height: 1.7;">
                In the meantime, feel free to reach out if you have any questions or additional information to share.
              </p>

              <!-- Contact Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #191919; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 4px 0; color: #ffffff; font-size: 18px; font-weight: 600;">
                      Naweed Hesan
                    </p>
                    <p style="margin: 0 0 16px 0; color: #8a8a8a; font-size: 14px;">
                      Graphic Designer
                    </p>
                    <p style="margin: 0 0 8px 0;">
                      <a href="mailto:naweedhesan@gmail.com" style="color: #f68700; font-size: 14px; text-decoration: none;">naweedhesan@gmail.com</a>
                    </p>
                    <p style="margin: 0;">
                      <a href="tel:5613658832" style="color: #f68700; font-size: 14px; text-decoration: none;">(561) 365-8832</a>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0 0; color: #b5b5b5; font-size: 16px; line-height: 1.7;">
                Looking forward to working with you!
              </p>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 16px; font-weight: 500;">
                Naweed
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #191919; padding: 24px 40px; text-align: center; border-top: 1px solid #2e2e2e;">
              <p style="margin: 0; color: #8a8a8a; font-size: 13px;">
                Pexivia Design Studio
              </p>
              <p style="margin: 8px 0 0 0; color: #8a8a8a; font-size: 12px;">
                This is an automated confirmation email. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
