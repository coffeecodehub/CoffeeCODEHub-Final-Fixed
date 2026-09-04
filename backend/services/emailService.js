const nodemailer = require('nodemailer');

function transporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) return null;

  // Render network timeout fix: Direct SSL over Port 465 with IPv4 force
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL port 465 ke liye true zaroori hai
    auth: {
      user: user,
      pass: pass
    },
    family: 4, // IPv6 unreachable bypass
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000
  });
}

async function sendLeadEmail(lead) {
  const t = transporter();
  if (!t) throw new Error('SMTP is not configured');

  const rows = Object.entries(lead.formData || {})
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px;font-weight:700">${k}</td><td style="padding:8px">${
          Array.isArray(v) ? v.join(', ') : v
        }</td></tr>`
    )
    .join('');

  return t.sendMail({
    from: process.env.SMTP_FROM || `"CoffeeCODEHub" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
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
  const t = transporter();
  if (!t) return;

  return t.sendMail({
    from: process.env.SMTP_FROM || `"CoffeeCODEHub" <${process.env.SMTP_USER}>`,
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