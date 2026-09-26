const path = require('path');
const fs = require('fs');
const { getTransporter } = require('./emailService');

const RESUME_PATHS = [
  path.join(process.cwd(), 'SurajNyavanandi-26R.pdf'),
  path.join(process.cwd(), 'SurajNyavanandi-Resume.pdf'),
  path.join(process.cwd(), 'public', 'SurajNyavanandi-26R.pdf'),
  path.join(process.cwd(), 'public', 'SurajNyavanandi-Resume.pdf'),
  path.join(__dirname, '..', '..', 'SurajNyavanandi-26R.pdf'),
  path.join(__dirname, '..', '..', 'SurajNyavanandi-Resume.pdf'),
];

function getResumePath() {
  for (const p of RESUME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const FRESHER_EMAIL_HTML = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #111827; line-height: 1.6;">
  <p>Dear Hiring Manager,</p>
  <p>I'm <b>Suraj Nyavanandi</b>, a <b>Fresher MERN Stack Developer</b> with 11 months of hands-on training and production-ready projects.</p>
  <p style="margin-top: 16px; margin-bottom: 8px;"><b>Quick Profile & Direct Links:</b></p>
  <p style="background: #f8fafc; padding: 14px 18px; border-radius: 8px; border: 1px solid #e2e8f0; line-height: 1.8;">
    <b>Contact:</b> <a href="tel:+919666635009" style="color: #2563eb; text-decoration: none;">+91 96666 35009</a><br>
    <b>Portfolio:</b> <a href="https://virattom.com" target="_blank" style="color: #2563eb; text-decoration: none;">https://virattom.com</a><br>
    <b>E-commerce Project:</b> <a href="https://shop.virattom.com" target="_blank" style="color: #2563eb; text-decoration: none;">https://shop.virattom.com</a><br>
    <b>GitHub:</b> <a href="https://github.com/SurajNyavanandi" target="_blank" style="color: #2563eb; text-decoration: none;">https://github.com/SurajNyavanandi</a><br>
    <b>LinkedIn:</b> <a href="https://www.linkedin.com/in/suraj-nyavanandi-305962286" target="_blank" style="color: #2563eb; text-decoration: none;">https://www.linkedin.com/in/suraj-nyavanandi-305962286</a><br>
  </p>
  <p style="margin-top: 16px;">My complete ATS-optimized resume is attached for your review. I would welcome the opportunity to discuss how I can contribute to your development team.</p>
  <p style="margin-top: 20px;">Best regards,<br><b>Suraj Nyavanandi</b></p>
</div>
`;

const EXPERIENCED_EMAIL_HTML = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #111827; line-height: 1.6;">
  <p>Dear Hiring Manager,</p>
  <p>I understand you require <b>1+ years of experience</b>.</p>
  <p>I don't have professional experience yet, but I have <b>11 months of rigorous training</b> with production-ready projects.</p>
  <p style="font-size: 16px; color: #1d4ed8;"><b>I humbly request you to consider my profile as a fresher.</b></p>
  <p style="margin-top: 16px; margin-bottom: 8px;"><b>Key Links & Verification:</b></p>
  <p style="background: #f8fafc; padding: 14px 18px; border-radius: 8px; border: 1px solid #e2e8f0; line-height: 1.8;">
    <b>Contact:</b> <a href="tel:+919666635009" style="color: #2563eb; text-decoration: none;">+91 96666 35009</a><br>
    <b>Portfolio:</b> <a href="https://virattom.com" target="_blank" style="color: #2563eb; text-decoration: none;">https://virattom.com</a><br>
    <b>E-commerce:</b> <a href="https://shop.virattom.com" target="_blank" style="color: #2563eb; text-decoration: none;">https://shop.virattom.com</a><br>
    <b>GitHub:</b> <a href="https://github.com/SurajNyavanandi" target="_blank" style="color: #2563eb; text-decoration: none;">https://github.com/SurajNyavanandi</a><br>
    <b>LinkedIn:</b> <a href="https://www.linkedin.com/in/suraj-nyavanandi-305962286" target="_blank" style="color: #2563eb; text-decoration: none;">https://www.linkedin.com/in/suraj-nyavanandi-305962286</a><br>
  </p>
  <p style="margin-top: 16px;">Please find my resume attached. Thank you for your time and consideration.</p>
  <p style="margin-top: 20px;">Sincerely,<br><b>Suraj Nyavanandi</b></p>
</div>
`;

/**
 * Send Fresher Email to one or more recipient emails
 */
async function sendFresherEmail({ emails }) {
  const emailList = Array.isArray(emails) ? emails : [emails];
  const validEmails = emailList.map((e) => String(e || '').trim()).filter(Boolean);

  if (validEmails.length === 0) {
    throw new Error('Emails are required');
  }

  const resumePath = getResumePath();
  if (!resumePath) {
    throw new Error('Resume file not found');
  }

  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_FROM || 'Suraj Nyavanandi <kanusuraj15@gmail.com>';
  const results = [];

  for (const email of validEmails) {
    const mailOptions = {
      from: fromEmail,
      to: email,
      subject: 'Application for MERN Stack Developer Role - Suraj Nyavanandi',
      html: FRESHER_EMAIL_HTML,
      attachments: [
        {
          filename: 'SurajNyavanandi-Resume.pdf',
          path: resumePath,
        },
      ],
    };

    if (transporter) {
      try {
        const info = await transporter.sendMail(mailOptions);
        results.push({ email, success: true, messageId: info.messageId });
        console.log(`[Outreach] Fresher email sent to ${email} (MessageId: ${info.messageId})`);
      } catch (err) {
        console.warn(`[Outreach Error] Failed sending fresher email to ${email}:`, err.message);
        results.push({ email, success: false, error: err.message });
      }
    } else {
      console.log(`[Outreach Simulation] Fresher email simulated to ${email} (Resume attached)`);
      results.push({ email, success: true, simulated: true });
    }
  }

  return results;
}

/**
 * Send Experienced Minimalist Email to one or more recipient emails
 */
async function sendExperiencedEmail({ emails }) {
  const emailList = Array.isArray(emails) ? emails : [emails];
  const validEmails = emailList.map((e) => String(e || '').trim()).filter(Boolean);

  if (validEmails.length === 0) {
    throw new Error('Emails are required');
  }

  const resumePath = getResumePath();
  if (!resumePath) {
    throw new Error('Resume file not found');
  }

  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_FROM || 'Suraj Nyavanandi <kanusuraj15@gmail.com>';
  const results = [];

  for (const email of validEmails) {
    const mailOptions = {
      from: fromEmail,
      to: email,
      subject: 'Application for MERN Stack Developer Role - Suraj Nyavanandi',
      html: EXPERIENCED_EMAIL_HTML,
      attachments: [
        {
          filename: 'SurajNyavanandi-Resume.pdf',
          path: resumePath,
        },
      ],
    };

    if (transporter) {
      try {
        const info = await transporter.sendMail(mailOptions);
        results.push({ email, success: true, messageId: info.messageId });
        console.log(`[Outreach] Experienced email sent to ${email} (MessageId: ${info.messageId})`);
      } catch (err) {
        console.warn(`[Outreach Error] Failed sending experienced email to ${email}:`, err.message);
        results.push({ email, success: false, error: err.message });
      }
    } else {
      console.log(`[Outreach Simulation] Experienced email simulated to ${email} (Resume attached)`);
      results.push({ email, success: true, simulated: true });
    }
  }

  return results;
}

/**
 * Generate WhatsApp Link for Fresher Outreach
 */
function generateFresherWhatsApp(number) {
  if (!number) {
    throw new Error('Number is required');
  }

  const cleanedNumber = String(number).replace(/\D/g, '');
  const formattedNumber = cleanedNumber.length === 10 ? `91${cleanedNumber}` : cleanedNumber;

  const message = `Hi,

I'm Suraj Nyavanandi,

*FRESHER MERN STACK DEVELOPER*

Portfolio: https://virattom.com
E-commerce: https://shop.virattom.com
GitHub: https://github.com/SurajNyavanandi
LinkedIn: https://www.linkedin.com/in/suraj-nyavanandi-305962286
`;

  const whatsappURL = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;

  return {
    success: true,
    message: 'Fresher WhatsApp link generated',
    url: whatsappURL,
    formattedNumber,
    text: message,
  };
}

/**
 * Generate WhatsApp Link for Experienced (1+ yr) Outreach
 */
function generateExperiencedWhatsApp(number) {
  if (!number) {
    throw new Error('Number is required');
  }

  const cleanedNumber = String(number).replace(/\D/g, '');
  const formattedNumber = cleanedNumber.length === 10 ? `91${cleanedNumber}` : cleanedNumber;

  const message = `Hi,

I'm Suraj Nyavanandi.

I understand you need 1+ years experience.

I don't have professional experience yet, but I have 11 months of rigorous training with production-ready projects.

Please consider my profile as a fresher.

Portfolio: https://virattom.com
E-commerce: https://shop.virattom.com
GitHub: https://github.com/SurajNyavanandi
LinkedIn: https://www.linkedin.com/in/suraj-nyavanandi-305962286
`;

  const whatsappURL = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;

  return {
    success: true,
    message: 'Experienced WhatsApp link generated',
    url: whatsappURL,
    formattedNumber,
    text: message,
  };
}

module.exports = {
  getResumePath,
  sendFresherEmail,
  sendExperiencedEmail,
  generateFresherWhatsApp,
  generateExperiencedWhatsApp,
  FRESHER_EMAIL_HTML,
  EXPERIENCED_EMAIL_HTML,
};
