// ==============================================================================
// TODO: Resume PDF email dispatch and recruiter outreach will be implemented in a future update.
// For now, this service provides safe simulated responses to prevent UI breakage.
// ==============================================================================

const path = require('path');
const fs = require('fs');

const RESUME_PATHS = [
  path.join(process.cwd(), 'SurajNyavanandi-26R.pdf'),
  path.join(process.cwd(), 'SurajNyavanandi-Resume.pdf'),
  path.join(process.cwd(), 'public', 'SurajNyavanandi-26R.pdf'),
  path.join(process.cwd(), 'public', 'SurajNyavanandi-Resume.pdf'),
];

function getResumePath() {
  for (const p of RESUME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function getOutreachConfig() {
  return {
    phone: '+91 96666 35009',
    portfolioUrl: 'https://virattom.com',
    ecommerceUrl: 'https://shop.virattom.com',
    githubUrl: 'https://github.com/SurajNyavanandi',
    linkedinUrl: 'https://www.linkedin.com/in/suraj-nyavanandi-305962286',
    fromEmail: process.env.SMTP_USER ? `Suraj Nyavanandi <${process.env.SMTP_USER}>` : 'kanusuraj15@gmail.com',
  };
}

function getFresherEmailHtml() {
  const { phone, portfolioUrl, ecommerceUrl, githubUrl, linkedinUrl } = getOutreachConfig();
  const cleanPhoneLink = phone.replace(/[^\d+]/g, '');

  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #111827; line-height: 1.6;">
  <p>Dear Hiring Manager,</p>
  <p>I'm <b>Suraj Nyavanandi</b>, a <b>Fresher MERN Stack Developer</b> with 11 months of hands-on training and production-ready projects.</p>
  <p style="margin-top: 16px; margin-bottom: 8px;"><b>Quick Profile & Direct Links:</b></p>
  <p style="background: #f8fafc; padding: 14px 18px; border-radius: 8px; border: 1px solid #e2e8f0; line-height: 1.8;">
    <b>Contact:</b> <a href="tel:${cleanPhoneLink}" style="color: #2563eb; text-decoration: none;">${phone}</a><br>
    <b>Portfolio:</b> <a href="${portfolioUrl}" target="_blank" style="color: #2563eb; text-decoration: none;">${portfolioUrl}</a><br>
    <b>E-commerce Project:</b> <a href="${ecommerceUrl}" target="_blank" style="color: #2563eb; text-decoration: none;">${ecommerceUrl}</a><br>
    <b>GitHub:</b> <a href="${githubUrl}" target="_blank" style="color: #2563eb; text-decoration: none;">${githubUrl}</a><br>
    <b>LinkedIn:</b> <a href="${linkedinUrl}" target="_blank" style="color: #2563eb; text-decoration: none;">${linkedinUrl}</a><br>
  </p>
  <p style="margin-top: 16px;">My complete ATS-optimized resume is attached for your review. I would welcome the opportunity to discuss how I can contribute to your development team.</p>
  <p style="margin-top: 20px;">Best regards,<br><b>Suraj Nyavanandi</b></p>
</div>
`;
}

function getExperiencedEmailHtml() {
  const { phone, portfolioUrl, ecommerceUrl, githubUrl, linkedinUrl } = getOutreachConfig();
  const cleanPhoneLink = phone.replace(/[^\d+]/g, '');

  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #111827; line-height: 1.6;">
  <p>Dear Hiring Manager,</p>
  <p>I'm <b>Suraj Nyavanandi</b>, a <b>Full Stack Developer (React / Node / MERN)</b> with hands-on experience architecting full-stack web applications, RESTful microservices, and client collaboration portals.</p>
  <p style="margin-top: 16px; margin-bottom: 8px;"><b>Quick Profile & Live Projects:</b></p>
  <p style="background: #f8fafc; padding: 14px 18px; border-radius: 8px; border: 1px solid #e2e8f0; line-height: 1.8;">
    <b>Contact:</b> <a href="tel:${cleanPhoneLink}" style="color: #2563eb; text-decoration: none;">${phone}</a><br>
    <b>Portfolio & Agency:</b> <a href="${portfolioUrl}" target="_blank" style="color: #2563eb; text-decoration: none;">${portfolioUrl}</a><br>
    <b>E-commerce Platform:</b> <a href="${ecommerceUrl}" target="_blank" style="color: #2563eb; text-decoration: none;">${ecommerceUrl}</a><br>
    <b>GitHub:</b> <a href="${githubUrl}" target="_blank" style="color: #2563eb; text-decoration: none;">${githubUrl}</a><br>
    <b>LinkedIn:</b> <a href="${linkedinUrl}" target="_blank" style="color: #2563eb; text-decoration: none;">${linkedinUrl}</a><br>
  </p>
  <p style="margin-top: 16px;">My resume is attached for your review. I would appreciate the opportunity to interview and demonstrate how my technical background aligns with your openings.</p>
  <p style="margin-top: 20px;">Best regards,<br><b>Suraj Nyavanandi</b></p>
</div>
`;
}

function getFresherWhatsAppText() {
  return `Hi, I am Suraj Nyavanandi. I came across the open MERN Stack Developer role at your organization. I have built full-stack applications with React, Node.js, Express, and MongoDB. Portfolio: https://virattom.com | GitHub: https://github.com/SurajNyavanandi. Would love to connect!`;
}

function getExperiencedWhatsAppText() {
  return `Hi, I am Suraj Nyavanandi, a Full-Stack Developer with hands-on experience building production React/Node applications and client portals. Portfolio: https://virattom.com | GitHub: https://github.com/SurajNyavanandi. Looking forward to discussing opportunities!`;
}

function generateWhatsAppLink(phoneNumber, type = 'fresher') {
  if (!phoneNumber) throw new Error('Phone number is required');
  const clean = String(phoneNumber).replace(/\D/g, '');
  const targetNumber = clean.length === 10 ? `91${clean}` : clean;
  const message = type === 'experienced' ? getExperiencedWhatsAppText() : getFresherWhatsAppText();
  const encoded = encodeURIComponent(message);
  return {
    url: `https://wa.me/${targetNumber}?text=${encoded}`,
    message,
    formattedNumber: targetNumber,
  };
}

// TODO: Resume PDF email dispatch and recruiter outreach will be implemented in a future update.
async function sendFresherEmail(emails) {
  const emailList = Array.isArray(emails) ? emails : [emails];
  const validEmails = emailList.map(e => String(e).trim()).filter(e => e.includes('@'));
  console.log(`[Outreach Service] Recruiter outreach paused for future implementation (Targets: ${validEmails.join(', ')})`);
  return {
    success: true,
    simulated: true,
    message: 'Recruiter outreach feature is paused for future implementation.',
    results: validEmails.map(email => ({ email, success: true, simulated: true })),
  };
}

// TODO: Resume PDF email dispatch and recruiter outreach will be implemented in a future update.
async function sendExperiencedEmail(emails) {
  const emailList = Array.isArray(emails) ? emails : [emails];
  const validEmails = emailList.map(e => String(e).trim()).filter(e => e.includes('@'));
  console.log(`[Outreach Service] Recruiter outreach paused for future implementation (Targets: ${validEmails.join(', ')})`);
  return {
    success: true,
    simulated: true,
    message: 'Recruiter outreach feature is paused for future implementation.',
    results: validEmails.map(email => ({ email, success: true, simulated: true })),
  };
}

module.exports = {
  getResumePath,
  getOutreachConfig,
  getFresherEmailHtml,
  getExperiencedEmailHtml,
  getFresherWhatsAppText,
  getExperiencedWhatsAppText,
  generateWhatsAppLink,
  sendFresherEmail,
  sendExperiencedEmail,
};
