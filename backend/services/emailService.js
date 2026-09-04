const nodemailer = require('nodemailer');

function transporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;

  // Agar Gmail host set hai ya service gmail hai, to native service use karein
  const isGmail = (process.env.SMTP_HOST || '').toLowerCase().includes('gmail');

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Custom SMTP configuration with IPv4 force
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE) === 'true' || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    family: 4, // Outbound IPv6 block bypass karne ke liye IPv4 force karta hai
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
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