const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Official custom domain sender address
const SENDER_EMAIL = process.env.RESEND_FROM || 'CoffeeCODEHub <info@coffeecodehub.com>';

async function sendLeadEmail(lead) {
  if (!resend) {
    console.error('RESEND_API_KEY is missing on Render');
    throw new Error('Email service not configured');
  }

  const rows = Object.entries(lead.formData || {})
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px;font-weight:700">${k}</td><td style="padding:8px">${
          Array.isArray(v) ? v.join(', ') : v
        }</td></tr>`
    )
    .join('');

  const adminEmail = process.env.ADMIN_EMAIL || 'your-email@gmail.com';

  return await resend.emails.send({
    from: SENDER_EMAIL,
    to: adminEmail,
    subject: `New CoffeeCODEHub Service Request — ${lead.requestId}`,
    html: `<div style="font-family:Arial;color:#17202a">
      <h2>New CoffeeCODEHub Service Request</h2>
      <p><b>Request ID:</b> ${lead.requestId}</p>
      <p><b>Client:</b> ${lead.clientName}</p>
      <p><b>Email:</b> ${lead.email}</p>
      <p><b>Phone:</b> ${lead.phone || '-'}</p>
      <p><b>Company:</b> ${lead.companyName || '-'}</p>
      <p><b>Service:</b> ${lead.selectedService || '-'}</p>
      <p><b>Budget:</b> ${lead.estimatedBudget || '-'}</p>
      <p><b>Timeline:</b> ${lead.timeline || '-'}</p>
      <p><b>Requirements:</b> ${lead.projectScopeDetails}</p>
      ${
        rows
          ? `<table border="1" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%"><tbody>${rows}</tbody></table>`
          : ''
      }
      <p>Open the admin dashboard to review and update this lead.</p>
    </div>`
  });
}

async function sendClientConfirmation(lead) {
  if (!resend) return;

  return await resend.emails.send({
    from: SENDER_EMAIL,
    to: lead.email,
    subject: `CoffeeCODEHub — Request Received (${lead.requestId})`,
    html: `<div style="font-family:Arial">
      <h2>Request Received</h2>
      <p>Hi ${lead.clientName},</p>
      <p>We received your request for <b>${lead.selectedService || 'a service'}</b>.</p>
      <p>Your reference is <b>${lead.requestId}</b>. Our team will review your requirements and contact you shortly.</p>
      <p>Thank you,<br/>CoffeeCODEHub</p>
    </div>`
  });
}

module.exports = { sendLeadEmail, sendClientConfirmation };