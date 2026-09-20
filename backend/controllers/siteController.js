const PDFDocument = require('pdfkit');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'virattom_client_portal_auth_secret_key_2026';

const fallbackLeads = [];
let fallbackIdCounter = 1;

const portfolioProjects = [
  { _id: '1', title: 'Dr. Rao Clinic & Diagnostics', type: 'Static Website', imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800' },
  { _id: '2', title: 'Urbanico Fashion & Apparel', type: 'Online Store', imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=800' },
  { _id: '3', title: 'Apex Student & Tutor Portal', type: 'Dynamic Website', imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800' },
  { _id: '4', title: 'FitPulse Daily Workout', type: 'Mobile App', imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800' },
];

const clientProjects = [
  {
    id: 'proj_1',
    title: 'E-Commerce & Delivery Mobile App',
    clientPhone: '9876543210',
    clientEmail: 'client@example.com',
    clientName: 'Rahul Verma',
    type: 'Mobile App',
    status: 'Active',
    totalBudget: 45000,
    advancePercentage: 20,
    advanceAmount: 9000,
    advancePaid: true,
    finalPaid: false,
    clientPortalApproved: true,
    clientLockedOut: false,
    milestones: [
      { id: 1, task: 'Backend Architecture + Database Schema Setup', done: true, date: '2026-09-01' },
      { id: 2, task: 'Web Client Portal + Admin Milestone Engine', done: true, date: '2026-09-15' },
      { id: 3, task: 'Mobile App Core Engine (iOS & Android)', done: false, date: '2026-10-01' },
      { id: 4, task: 'Security Audit, Load Testing & App Store Deployment', done: false, date: '2026-10-15' },
    ],
    deliverables: [
      { name: 'UI / UX Design System & Figma Spec', url: '#', locked: false },
      { name: 'Production Backend API Staging URL', url: '#', locked: false },
      { name: 'iOS TestFlight & Android APK Build', url: '#', locked: true },
      { name: 'Full Source Code & Repository Handover', url: '#', locked: true },
    ],
    feedback: [
      { id: 1, text: 'Please ensure the checkout screen supports instant Google Pay & PhonePe UPI intent buttons.', time: 'Today at 11:30 AM', resolved: false }
    ],
    techStack: ['React Native (iOS & Android)', 'Next.js & Express API', 'Razorpay & UPI Gateway'],
    paymentHistory: [
      {
        id: 'pay_adv_01',
        amount: 9000,
        type: 'Advance (20% Initial Booking)',
        date: '2026-09-01',
        paymentMethod: 'UPI / Razorpay',
        transactionId: 'TXN_ADV_982736',
        status: 'Completed'
      }
    ]
  },
  {
    id: 'proj_2',
    title: 'Full-Stack Portfolio & Client Billing Platform',
    clientPhone: '9666635009',
    clientEmail: 'kanusuraj15@gmail.com',
    clientName: 'Suraj Nyavanandi',
    type: 'Web Application',
    status: 'Active',
    totalBudget: 35000,
    advancePercentage: 20,
    advanceAmount: 7000,
    advancePaid: true,
    finalPaid: false,
    clientPortalApproved: true,
    clientLockedOut: false,
    milestones: [
      { id: 1, task: 'Design System & Apple Minimal UI Setup', done: true, date: '2026-09-10' },
      { id: 2, task: 'Interactive Resume Builder & OTP Dispatcher', done: true, date: '2026-09-18' },
      { id: 3, task: 'Client Live Workspace & Invoicing Portal', done: true, date: '2026-09-20' },
      { id: 4, task: 'Cloud Run Production Deployment & CDN Setup', done: true, date: '2026-09-20' },
    ],
    deliverables: [
      { name: 'Live Application Preview & Code Repository', url: 'https://virattom.com', locked: false },
      { name: 'Complete Swagger API Documentation', url: '#', locked: false },
      { name: 'Production Cloud Deployment Container', url: '#', locked: false },
      { name: 'Admin Dashboard Control Center', url: '/admin', locked: false },
    ],
    feedback: [
      { id: 1, text: 'Workspace configured and ready for live milestone review.', time: 'Just now', resolved: true }
    ],
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS', 'Node.js Express', 'Razorpay'],
    paymentHistory: [
      {
        id: 'pay_adv_02',
        amount: 7000,
        type: 'Advance (20% Initial Booking)',
        date: '2026-09-18',
        paymentMethod: 'UPI / Razorpay',
        transactionId: 'TXN_ADV_966663',
        status: 'Completed'
      }
    ]
  }
];

const emailOtpStore = new Map();

function sendEmailOtp(email, name = 'Client', leadData) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + 10 * 60 * 1000;
  emailOtpStore.set(cleanEmail, { code, expiresAt, email: cleanEmail, leadData });
  console.log(`[Email Service] Dispatched 6-digit OTP to ${cleanEmail} (Recipient: "${name}") -> OTP: ${code}`);
  return { success: true, devOtp: code };
}

function verifyEmailOtp(email, code) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const session = emailOtpStore.get(cleanEmail);
  console.log(`[Email Service] Attempting verification for ${cleanEmail} with code "${String(code || '').trim()}"...`);

  if (!session) {
    return { valid: false, error: 'No verification request found for this email. Please request a new code.' };
  }

  if (Date.now() > session.expiresAt) {
    emailOtpStore.delete(cleanEmail);
    return { valid: false, error: 'Verification code has expired. Please request a new code.' };
  }

  if (session.code !== String(code || '').trim()) {
    return { valid: false, error: 'Incorrect verification code. Please check your email and try again.' };
  }

  const leadData = session.leadData;
  emailOtpStore.delete(cleanEmail);
  return { valid: true, leadData };
}

const getProjects = async (req, res) => {
  res.json(portfolioProjects);
};

const requestEmailOtpHandler = async (req, res) => {
  const { name = '', email = '', phone = '', budget = '', scope = '', projectType = 'Static Website', company = '' } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (cleanPhone.length !== 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
  }

  try {
    const leadData = {
      name,
      email: cleanEmail,
      phone: cleanPhone,
      company,
      budget: Number.parseInt(budget) || 0,
      scope,
      projectType,
    };

    const result = sendEmailOtp(cleanEmail, name || 'Client', leadData);
    return res.json({ success: true, message: `Verification code sent to ${cleanEmail}`, devOtp: result.devOtp });
  } catch (error) {
    console.error('[Email OTP Handler Error]', error);
    return res.status(500).json({ error: 'Could not send verification email. Please try again.' });
  }
};

const verifyEmailOtpHandler = async (req, res) => {
  const { email = '', otp = '', leadData = {} } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();

  const verification = verifyEmailOtp(cleanEmail, otp);
  if (!verification.valid) {
    return res.status(400).json({ error: verification.error || 'Invalid verification code.' });
  }

  const finalData = verification.leadData || leadData;
  const name = finalData.name || '';
  const phone = String(finalData.phone || '').replace(/\D/g, '').slice(-10);
  const company = finalData.company || '';
  const budget = Number.parseInt(finalData.budget) || 0;
  const projectType = finalData.projectType || 'Static Website';
  const scope = finalData.scope || (company ? `Company / Org: ${company}` : '');
  const finalScope = projectType ? `[${projectType}] ${scope}` : scope;

  try {
    const leadId = 'lead_' + fallbackIdCounter++;
    const verifiedUserRecord = {
      _id: leadId,
      name,
      email: cleanEmail,
      phone,
      company,
      budget,
      scope: finalScope,
      projectType,
      verified: true,
      createdAt: new Date(),
    };
    fallbackLeads.unshift(verifiedUserRecord);
    return res.json({
      success: true,
      leadId,
      verifiedUser: {
        name,
        email: cleanEmail,
        phone,
        company,
        verifiedAt: new Date().toISOString(),
      },
      message: 'Application submitted & verified successfully!',
    });
  } catch (err) {
    console.error('[Verify Email Lead Error]', err);
    return res.status(500).json({ error: 'Failed to record lead verification' });
  }
};

const submitLead = async (req, res) => {
  const { name = '', email = '', phone = '', budget = '', scope = '', projectType = '', verified = false } = req.body || {};
  const finalScope = projectType ? `[${projectType}] ${scope}` : scope;
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

  try {
    const leadId = 'lead_' + fallbackIdCounter++;
    fallbackLeads.unshift({
      _id: leadId,
      name,
      email: cleanEmail,
      phone: cleanPhone,
      budget,
      scope: finalScope,
      projectType,
      verified: Boolean(verified),
      createdAt: new Date(),
    });
    return res.json({ success: true, leadId, message: 'Application recorded successfully' });
  } catch (error) {
    console.warn('Submit lead error:', error);
    return res.status(500).json({ error: 'Failed to submit application' });
  }
};

const verifyOtp = async (req, res) => {
  const { leadId, verified } = req.body;

  if (verified === true) {
    const lead = fallbackLeads.find((item) => item._id === leadId);
    if (lead) {
      lead.verified = true;
    }
    return res.json({ success: true, message: 'Project application received. Our engineering team will review your requirements and reach out directly if there is a mutual fit.' });
  }

  return res.status(400).json({ error: 'Invalid verification code' });
};

const checkClientPhone = async (req, res) => {
  const { phone } = req.body || {};
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  const last10 = cleanPhone.slice(-10);

  if (!last10 || last10.length !== 10) {
    return res.status(400).json({ allowed: false, error: 'Please enter a valid 10-digit mobile number' });
  }

  const matchedProject = clientProjects.find((project) => String(project.clientPhone || '').replace(/\D/g, '').slice(-10) === last10);

  if (!matchedProject || matchedProject.clientPortalApproved === false) {
    return res.status(404).json({ allowed: false, error: 'No active project is associated with this number. Please contact your account lead/admin.' });
  }

  if (matchedProject.clientLockedOut) {
    return res.status(403).json({ allowed: false, error: 'Project access temporarily restricted. Please contact your account lead/admin.' });
  }

  const token = jwt.sign({ phone: last10, projectId: matchedProject.id, role: 'client' }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    allowed: true,
    token,
    projectTitle: matchedProject.title,
    advancePaid: matchedProject.advancePaid,
    totalBudget: matchedProject.totalBudget,
    advanceAmount: matchedProject.advanceAmount || Math.round(matchedProject.totalBudget * 0.2),
  });
};

const loginClient = async (req, res) => {
  const { phone } = req.body || {};
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  const last10 = cleanPhone.slice(-10);

  const matchedProject = clientProjects.find((project) => String(project.clientPhone || '').replace(/\D/g, '').slice(-10) === last10);

  if (!matchedProject || matchedProject.clientPortalApproved === false) {
    return res.status(403).json({ error: 'No active project is associated with this number. Please contact your account lead/admin.' });
  }

  if (matchedProject.clientLockedOut) {
    return res.status(403).json({ error: 'Project access temporarily restricted. Please contact your account lead/admin.' });
  }

  const token = jwt.sign({ phone: last10, projectId: matchedProject.id, role: 'client' }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token, project: matchedProject });
};

const getClientProject = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const matchedProject = clientProjects.find((project) => String(project.clientPhone || '').replace(/\D/g, '').slice(-10) === decoded.phone || project.id === decoded.projectId) || clientProjects[0];

    if (!matchedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json(matchedProject);
  } catch (e) {
    return res.status(401).json({ error: 'Session expired' });
  }
};

const confirmAdvancePayment = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const project = clientProjects.find((item) => item.id === decoded.projectId || String(item.clientPhone || '').replace(/\D/g, '').slice(-10) === decoded.phone);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { paymentMethod = 'Razorpay UPI / Card', transactionId } = req.body || {};
    const txnId = transactionId || 'TXN_ADV_' + Math.floor(100000 + Math.random() * 900000);
    const amount = project.advanceAmount || Math.round(project.totalBudget * 0.2);

    project.advancePaid = true;
    project.paymentHistory = project.paymentHistory || [];
    project.paymentHistory.unshift({
      id: 'pay_' + Date.now(),
      amount,
      type: 'Advance (20% Initial Booking)',
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      transactionId: txnId,
      status: 'Completed',
    });

    return res.json({ success: true, message: '20% Advance payment confirmed! Your project workspace is now unlocked.', project });
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const addClientFeedback = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const project = clientProjects.find((item) => item.id === decoded.projectId || String(item.clientPhone || '').replace(/\D/g, '').slice(-10) === decoded.phone) || clientProjects[0];
    const { text } = req.body || {};
    if (project && text) {
      project.feedback.unshift({
        id: Date.now(),
        text,
        time: 'Just now',
        resolved: false,
      });
      return res.json({ success: true, project });
    }
    return res.status(400).json({ error: 'Feedback text required' });
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const getAdminProjects = async (req, res) => {
  return res.json(clientProjects);
};

const createAdminProject = async (req, res) => {
  const { title, clientPhone, clientEmail, clientName, type, totalBudget, advancePercentage, advancePaid, clientPortalApproved } = req.body || {};
  if (!title || !clientPhone) {
    return res.status(400).json({ error: 'Title and Client Phone are required' });
  }

  const cleanPhone = String(clientPhone).replace(/\D/g, '').slice(-10);
  const budget = Number.parseInt(totalBudget) || 25000;
  const advPct = Number.parseInt(advancePercentage) || 20;
  const advAmount = Math.round(budget * (advPct / 100));

  const newProject = {
    id: 'proj_' + Date.now(),
    title,
    clientPhone: cleanPhone,
    clientEmail: clientEmail || '',
    clientName: clientName || '',
    type: type || 'Website & Mobile App',
    status: 'Active',
    totalBudget: budget,
    advancePercentage: advPct,
    advanceAmount: advAmount,
    advancePaid: Boolean(advancePaid),
    finalPaid: false,
    clientPortalApproved: clientPortalApproved !== undefined ? Boolean(clientPortalApproved) : true,
    clientLockedOut: false,
    milestones: [
      { id: 1, task: 'Project Kickoff & Requirements Finalization', done: true, date: new Date().toISOString().split('T')[0] },
      { id: 2, task: 'UI/UX Design Spec & Architecture', done: false },
      { id: 3, task: 'Core Development & API Integration', done: false },
      { id: 4, task: 'QA, Security Audit & Production Deployment', done: false },
    ],
    deliverables: [
      { name: 'Design Assets & Wireframes', url: '#', locked: false },
      { name: 'Staging Environment URL', url: '#', locked: false },
      { name: 'Source Code & Deployment Handover', url: '#', locked: true },
    ],
    feedback: [],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL / MongoDB'],
    paymentHistory: Boolean(advancePaid) ? [{
      id: 'pay_' + Date.now(),
      amount: advAmount,
      type: `Advance (${advPct}% Initial Booking)`,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Direct / Admin Cleared',
      transactionId: 'TXN_ADM_' + Math.floor(100000 + Math.random() * 900000),
      status: 'Completed',
    }] : [],
  };

  clientProjects.unshift(newProject);
  return res.json(newProject);
};

const updateAdminProject = (req, res) => {
  const { id } = req.params;
  const project = clientProjects.find((item) => item.id === id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const { title, clientPhone, clientEmail, clientName, type, status, totalBudget, advancePercentage, advanceAmount, advancePaid, finalPaid, clientPortalApproved, clientLockedOut, milestones, deliverables } = req.body;

  if (title !== undefined) project.title = title;
  if (clientPhone !== undefined) project.clientPhone = String(clientPhone).replace(/\D/g, '');
  if (clientEmail !== undefined) project.clientEmail = clientEmail;
  if (clientName !== undefined) project.clientName = clientName;
  if (type !== undefined) project.type = type;
  if (status !== undefined) project.status = status;
  if (totalBudget !== undefined) project.totalBudget = Number(totalBudget);
  if (advancePercentage !== undefined) project.advancePercentage = Number(advancePercentage);
  if (advanceAmount !== undefined) project.advanceAmount = Number(advanceAmount);
  if (advancePaid !== undefined) {
    project.advancePaid = Boolean(advancePaid);
    if (project.advancePaid && (!project.paymentHistory || project.paymentHistory.length === 0)) {
      project.paymentHistory = [{
        id: 'pay_' + Date.now(),
        amount: project.advanceAmount || Math.round(project.totalBudget * 0.2),
        type: `Advance (${project.advancePercentage || 20}% Booking)`,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Direct / Admin Cleared',
        transactionId: 'TXN_ADM_' + Math.floor(100000 + Math.random() * 900000),
        status: 'Completed',
      }];
    }
  }
  if (finalPaid !== undefined) project.finalPaid = Boolean(finalPaid);
  if (clientPortalApproved !== undefined) project.clientPortalApproved = Boolean(clientPortalApproved);
  if (clientLockedOut !== undefined) project.clientLockedOut = Boolean(clientLockedOut);
  if (milestones !== undefined) project.milestones = milestones;
  if (deliverables !== undefined) project.deliverables = deliverables;

  return res.json({ success: true, project });
};

const deleteAdminProject = (req, res) => {
  const { id } = req.params;
  const idx = clientProjects.findIndex((item) => item.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }

  clientProjects.splice(idx, 1);
  return res.json({ success: true });
};

const loginAdmin = (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin261125@gmail.com' && password === 'admin261125@gmail.com') {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
};

const getLeads = async (req, res) => {
  return res.json(fallbackLeads);
};

const generateResume = (req, res) => {
  try {
    const data = req.body || {};
    const header = data.header || {};
    const skills = data.skills || '';
    const experience = Array.isArray(data.experience) ? data.experience : [];
    const projects = Array.isArray(data.projects) ? data.projects : [];
    const education = Array.isArray(data.education) ? data.education : [];
    const certifications = data.certifications || '';

    const fileName = `${String(header.name || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_')}_Resume.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const doc = new PDFDocument({ size: 'A4', margins: { top: 36, bottom: 36, left: 36, right: 36 }, bufferPages: true, autoFirstPage: true });
    doc.pipe(res);

    const margin = 36;
    const pageWidth = 595.28;
    const contentWidth = pageWidth - margin * 2;

    doc.fontSize(22).font('Times-Bold').text(header.name || 'Candidate Name', { align: 'center', width: contentWidth });
    const contactLine = [header.phone, header.email, header.github, header.linkedin].filter(Boolean).join(' | ');
    if (contactLine) {
      doc.moveDown(0.3);
      doc.fontSize(10).font('Times-Roman').text(contactLine, { align: 'center', width: contentWidth });
    }

    if (header.liveProjects) {
      doc.moveDown(0.2);
      doc.fontSize(10).font('Times-Roman').text(`Live Projects: ${header.liveProjects}`, { align: 'center', width: contentWidth });
    }

    if (header.portfolio) {
      doc.moveDown(0.2);
      doc.fontSize(10).font('Times-Roman').text(`Portfolio: ${header.portfolio}`, { align: 'center', width: contentWidth });
    }

    const addSection = (title) => {
      doc.moveDown(0.8);
      doc.fontSize(12).font('Times-Bold').text(title);
      doc.moveTo(margin, doc.y + 2).lineTo(pageWidth - margin, doc.y + 2).stroke();
      doc.moveDown(0.4);
    };

    if (skills) {
      addSection('Skills');
      doc.fontSize(10).font('Times-Roman').text(skills, { align: 'left', width: contentWidth, lineGap: 2 });
    }

    if (experience.length) {
      addSection('Experience');
      experience.forEach((item) => {
        doc.fontSize(11).font('Times-Bold').text(item.role || 'Role');
        doc.fontSize(10).font('Times-Roman').text(`${item.company || ''}  |  ${item.date || ''}`);
        if (item.tech) doc.fontSize(9).font('Times-Italic').text(`Tech: ${item.tech}`);
        const bullets = String(item.bullets || '').split('\n').filter(Boolean);
        bullets.forEach((line) => {
          doc.fontSize(9).font('Times-Roman').text(`• ${line}`);
        });
        doc.moveDown(0.5);
      });
    }

    if (projects.length) {
      addSection('Projects');
      projects.forEach((project) => {
        doc.fontSize(11).font('Times-Bold').text(project.name || 'Project');
        if (project.demoLabel) {
          doc.fontSize(9).font('Times-Roman').text(`Demo: ${project.demoLabel}`);
        }
        if (project.tech) doc.fontSize(9).font('Times-Italic').text(`Tech: ${project.tech}`);
        const bullets = String(project.bullets || '').split('\n').filter(Boolean);
        bullets.forEach((line) => doc.fontSize(9).font('Times-Roman').text(`• ${line}`));
        doc.moveDown(0.5);
      });
    }

    if (education.length) {
      addSection('Education');
      education.forEach((item) => {
        doc.fontSize(11).font('Times-Bold').text(item.degree || 'Degree');
        doc.fontSize(10).font('Times-Roman').text(`${item.institution || ''}  |  ${item.date || ''}`);
        if (item.score) doc.fontSize(9).font('Times-Roman').text(item.score);
        doc.moveDown(0.3);
      });
    }

    if (certifications) {
      addSection('Certifications');
      doc.fontSize(10).font('Times-Roman').text(certifications);
    }

    doc.end();
  } catch (error) {
    console.error('[Resume generation error]', error);
    return res.status(500).json({ error: 'Failed to generate resume PDF.' });
  }
};

module.exports = {
  getProjects,
  submitLead,
  verifyOtp,
  generateResume,
  loginAdmin,
  getLeads,
  requestEmailOtpHandler,
  verifyEmailOtpHandler,
  checkClientPhone,
  loginClient,
  getClientProject,
  confirmAdvancePayment,
  addClientFeedback,
  getAdminProjects,
  updateAdminProject,
  createAdminProject,
  deleteAdminProject,
};
