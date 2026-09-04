const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Verified domain sender: coffecodehub.com
const SENDER_EMAIL = 'CoffeeCODEHub <info@coffecodehub.com>';

async function sendLeadEmail(lead) {
  if (!resend) {
    console.error('RESEND_API_KEY is missing on Render!');
    throw new Error('Email service not configured');
  }

  // Render form data rows dynamically
  const rows = Object.entries(lead.formData || {})
    .map(
      ([k, v]) =>
        `<tr>
          <td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc;width:35%">${k}</td>
          <td style="padding:10px;border:1px solid #e2e8f0;">${Array.isArray(v) ? v.join(', ') : v}</td>
        </tr>`
    )
    .join('');

  // Target email jahan aapko data chahiye:
  // Render env variable check karega, agar missing ho to direct lead.email ya notification par
  const notifyEmail = process.env.NOTIFICATION_EMAIL;

  if (!notifyEmail) {
    console.warn('⚠️ WARNING: NOTIFICATION_EMAIL is not set in Render environment variables!');
  }

  const targetEmail = notifyEmail || 'yourpersonalemail@gmail.com'; // <-- Yahan apna Gmail address likhein

  const result = await resend.emails.send({
    from: SENDER_EMAIL,
    to: targetEmail,
    subject: `🔥 New Lead Form Submission — ${lead.clientName} (${lead.requestId || 'Website'})`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#1e293b;max-width:650px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:8px">
        <h2 style="color:#0f172a;border-bottom:2px solid #3b82f6;padding-bottom:10px;margin-top:0">New Lead Submission Details</h2>
        
        <p><b>Request ID:</b> ${lead.requestId || 'N/A'}</p>
        <p><b>Client Name:</b> ${lead.clientName || 'N/A'}</p>
        <p><b>Client Email:</b> <a href="mailto:${lead.email}">${lead.email}</a></p>
        <p><b>Phone:</b> ${lead.phone || '-'}</p>
        <p><b>Company:</b> ${lead.companyName || '-'}</p>
        <p><b>Service Selected:</b> ${lead.selectedService || '-'}</p>
        <p><b>Budget:</b> ${lead.estimatedBudget || '-'}</p>
        <p><b>Timeline:</b> ${lead.timeline || '-'}</p>
        
        <h3 style="margin-top:20px;color:#334155">Project Scope / Message:</h3>
        <div style="background:#f1f5f9;padding:12px;border-radius:6px;white-space:pre-wrap">${lead.projectScopeDetails || 'No details provided'}</div>
        
        ${
          rows
            ? `<h3 style="margin-top:25px;color:#334155">Complete Form Data:</h3>
               <table style="border-collapse:collapse;width:100%;font-size:14px;margin-top:10px">
                 <tbody>${rows}</tbody>
               </table>`
            : ''
        }

        <p style="margin-top:30px;font-size:12px;color:#64748b;text-align:center">
          Received via CoffeeCODEHub Contact & Lead Engine
        </p>
      </div>`
  });

  console.log('Admin Notification Result:', JSON.stringify(result));
  return result;
}

async function sendClientConfirmation(lead) {
  if (!resend) return;

  const result = await resend.emails.send({
    from: SENDER_EMAIL,
    to: lead.email,
    subject: `CoffeeCODEHub — Request Received (${lead.requestId || 'Inquiry'})`,
    html: `<div style="font-family:Arial,sans-serif;color:#1e293b;padding:20px">
      <h2>Request Received</h2>
      <p>Hi ${lead.clientName},</p>
      <p>Thank you for reaching out to us. We have received your request regarding <b>${lead.selectedService || 'our services'}</b>.</p>
      <p>Your reference ID is <b>${lead.requestId}</b>. Our team will review your requirements and get back to you shortly.</p>
      <br/>
      <p>Best regards,<br/><b>CoffeeCODEHub Team</b><br/>https://coffecodehub.com</p>
    </div>`
  });

  console.log('Client Confirmation Result:', JSON.stringify(result));
  return result;
}

module.exports = { sendLeadEmail, sendClientConfirmation };