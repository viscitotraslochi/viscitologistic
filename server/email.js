// server/email.js
require('dotenv').config();
const formData = require('form-data');   // necessario per mailgun.js
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,   // la tua API Key di Mailgun
});

async function inviaEmail(to, subject, html) {
  try {
    const messageData = {
      from: `Viscito Logistic <${process.env.MAILGUN_SENDER}>`,
      to,
      subject,
      html
    };

    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, messageData);
    console.log('✅ Email inviata:', result);
  } catch (err) {
    console.error('❌ Errore invio email:', err);
  }
}

module.exports = inviaEmail;
