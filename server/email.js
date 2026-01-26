// email.js
const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY, // API Key di Mailgun
  url: 'https://api.mailgun.net'     // URL base dell’API
});

/**
 * Invia un’email tramite Mailgun
 * @param {string} to - destinatario
 * @param {string} subject - oggetto email
 * @param {string} html - corpo HTML
 */
async function inviaEmail(to, subject, html) {
  try {
    const info = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `"ViscitoLogistic" <no-reply@${process.env.MAILGUN_DOMAIN}>`,
      to,
      subject,
      html
    });
    console.log("✅ Email inviata:", info.id);
  } catch (err) {
    console.error("❌ Errore invio email:", err);
  }
}

module.exports = inviaEmail;
