/**
 * Nodemailer service. With SMTP unconfigured, emails are logged to the
 * console so nothing fails silently in development.
 */

let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

function fromAddress() {
  return process.env.MAIL_FROM || 'Shakti Textiles <sales@shaktitextiles.com>';
}

async function send(to, subject, text) {
  if (!transporter) {
    console.log(`[mail:dev] to=${to} | ${subject}\n${text}\n`);
    return { dev: true };
  }
  return transporter.sendMail({ from: fromAddress(), to, subject, text });
}

async function sendEnquiryAlert(enquiry) {
  return send(
    process.env.ENQUIRY_NOTIFY_EMAIL || 'sales@shaktitextiles.com',
    `New ${enquiry.status || 'NEW'} enquiry — ${enquiry.name}${enquiry.company ? ` (${enquiry.company})` : ''}`,
    [
      `Product: ${enquiry.product || '—'}`,
      `Quantity: ${enquiry.quantity || '—'}`,
      `Email: ${enquiry.email}`,
      `Phone: ${enquiry.phone || '—'}`,
      `Message: ${enquiry.message || '—'}`,
      `Manage: ${process.env.CLIENT_ORIGIN || ''}/admin`,
    ].join('\n'),
  );
}

async function sendEnquiryConfirmation(enquiry) {
  return send(
    enquiry.email,
    'We received your sample request — Shakti Textiles',
    [
      `Hello ${enquiry.name},`,
      '',
      'Thank you for contacting Shakti Textiles. Our export desk will reach you within 24 hours with specifications and pricing.',
      '',
      `Your reference: ${enquiry.product || 'General enquiry'}`,
      '',
      '— Shakti Textiles, Surat, India',
    ].join('\n'),
  );
}

async function sendContactAlert(contact) {
  return send(
    process.env.ENQUIRY_NOTIFY_EMAIL || 'sales@shaktitextiles.com',
    `Website contact — ${contact.name}`,
    `Email: ${contact.email}\nCompany: ${contact.company || '—'}\n\n${contact.message}`,
  );
}

module.exports = { send, sendEnquiryAlert, sendEnquiryConfirmation, sendContactAlert };
