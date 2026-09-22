const PDFDocument = require('pdfkit');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'virat-tom-secure-jwt-secret-key-2026';

const fallbackLeads = [];
let fallbackIdCounter = 1;

const portfolioProjects = [
  {
    _id: '1',
    title: 'Inisio',
    type: 'Web Application',
    url: 'https://inisio.vercel.app/',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    description: 'Modern full-stack productivity & workflow management web application.'
  },
  {
    _id: '2',
    title: 'Urbanico',
    type: 'Online Store',
    url: 'https://urbanico.vercel.app/',
    imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=800',
    description: 'High-performance e-commerce apparel platform with instant checkout & mobile responsiveness.'
  }
];

const clientProjects = [
  {
    id: 'proj_1',
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
        id: 'pay_adv_01',
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

    // Auto-create or connect client project when lead is verified
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    if (cleanPhone.length === 10) {
      let existingProject = clientProjects.find(
        (p) => String(p.clientPhone || '').replace(/\D/g, '').slice(-10) === cleanPhone
      );
      if (!existingProject) {
        const budgetNum = Number.parseInt(budget) || 25000;
        const advanceAmount = Math.round(budgetNum * 0.2);
        const newProject = {
          id: 'proj_' + Date.now(),
          title: `${projectType || 'Digital Product'} - ${name || 'Client'}`,
          clientPhone: cleanPhone,
          clientEmail: cleanEmail,
          clientName: name || 'Client',
          type: projectType || 'Website & Mobile App',
          status: 'Active',
          totalBudget: budgetNum,
          advancePercentage: 20,
          advanceAmount: advanceAmount,
          advancePaid: false,
          finalPaid: false,
          clientPortalApproved: true,
          clientLockedOut: false,
          milestones: [
            { id: 1, task: 'Scope Finalization & Technical Blueprint', done: true, date: new Date().toISOString().split('T')[0] },
            { id: 2, task: 'Architecture & UI/UX Design System', done: false },
            { id: 3, task: 'Full-Stack Development & API Integration', done: false },
            { id: 4, task: 'Testing, Cloud Deployment & Handover', done: false },
          ],
          deliverables: [
            { name: 'Architecture & Wireframe Specification', url: '#', locked: false },
            { name: 'Staging Environment Preview', url: '#', locked: false },
            { name: 'Source Code & Production Handover', url: '#', locked: true },
          ],
          feedback: [],
          techStack: ['React', 'TypeScript', 'Node.js', 'Razorpay'],
          paymentHistory: [],
        };
        clientProjects.unshift(newProject);
      }
    }

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

  const token = jwt.sign(
    {
      id: matchedProject.id,
      projectId: matchedProject.id,
      phone: last10,
      role: 'client',
      clientName: matchedProject.clientName,
      clientEmail: matchedProject.clientEmail,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  return res.json({ token, project: matchedProject });
};

const getClientProject = async (req, res) => {
  try {
    let clientAuth = req.client;
    if (!clientAuth) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Client token required' });
      }
      const token = authHeader.split(' ')[1];
      clientAuth = jwt.verify(token, JWT_SECRET);
    }

    const matchedProject = clientProjects.find(
      (project) =>
        project.id === clientAuth.projectId ||
        String(project.clientPhone || '').replace(/\D/g, '').slice(-10) === clientAuth.phone
    ) || clientProjects[0];

    if (!matchedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json(matchedProject);
  } catch {
    return res.status(401).json({ error: 'Session expired or invalid token' });
  }
};

const createRazorpayOrder = async (req, res) => {
  try {
    let clientAuth = req.client;
    if (!clientAuth) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        clientAuth = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      }
    }

    if (!clientAuth) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const project = clientProjects.find(
      (p) =>
        p.id === clientAuth.projectId ||
        String(p.clientPhone || '').replace(/\D/g, '').slice(-10) === clientAuth.phone
    ) || clientProjects[0];

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found for this client session' });
    }

    const advanceAmount = project.advanceAmount || Math.round((project.totalBudget || 25000) * 0.2);
    const amountInPaise = Math.round(advanceAmount * 100);

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      try {
        const Razorpay = require('razorpay');
        const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const rzpOrder = await rzp.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${project.id.slice(-8)}_${Date.now()}`.slice(0, 40),
          notes: {
            projectId: project.id,
            projectTitle: project.title,
            clientPhone: project.clientPhone,
            clientName: project.clientName || 'Client',
          },
        });

        return res.json({
          success: true,
          orderId: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency || 'INR',
          keyId,
          projectName: project.title,
          clientName: project.clientName || '',
          clientPhone: project.clientPhone || '',
          clientEmail: project.clientEmail || '',
        });
      } catch (rzpErr) {
        console.error('[Razorpay Order Gateway Error]:', rzpErr);
      }
    }

    // Standard fallback order for test/preview sandbox
    const fallbackKeyId = keyId || 'rzp_test_51ViratTomKey';
    const simulatedOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return res.json({
      success: true,
      orderId: simulatedOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: fallbackKeyId,
      projectName: project.title,
      clientName: project.clientName || '',
      clientPhone: project.clientPhone || '',
      clientEmail: project.clientEmail || '',
    });
  } catch (err) {
    console.error('[Create Razorpay Order Error]', err);
    return res.status(500).json({ success: false, error: 'Failed to initialize payment gateway order' });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    let clientAuth = req.client;
    if (!clientAuth) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        clientAuth = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      }
    }

    if (!clientAuth) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, error: 'Incomplete transaction response from Razorpay' });
    }

    const project = clientProjects.find(
      (p) =>
        p.id === clientAuth.projectId ||
        String(p.clientPhone || '').replace(/\D/g, '').slice(-10) === clientAuth.phone
    ) || clientProjects[0];

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found for this client session' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keySecret && razorpay_signature) {
      const crypto = require('crypto');
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, error: 'Payment signature mismatch. Verification failed.' });
      }
    }

    const amount = project.advanceAmount || Math.round((project.totalBudget || 25000) * 0.2);

    project.advancePaid = true;
    project.status = 'Active';
    project.paymentHistory = project.paymentHistory || [];
    project.paymentHistory.unshift({
      id: 'pay_' + Date.now(),
      amount,
      type: 'Advance (20% Initial Booking)',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Razorpay Gateway (UPI / NetBanking / Cards)',
      transactionId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: 'Completed',
    });

    return res.json({
      success: true,
      message: '20% Advance payment verified successfully! Project workspace is now fully unlocked.',
      project,
    });
  } catch (err) {
    console.error('[Verify Razorpay Payment Error]', err);
    return res.status(500).json({ success: false, error: 'Failed to verify transaction' });
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
    const project = clientProjects.find((item) => item.id === decoded.projectId || String(item.clientPhone || '').replace(/\D/g, '').slice(-10) === decoded.phone) || clientProjects[0];

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { paymentMethod = 'Razorpay Gateway', transactionId, orderId } = req.body || {};
    const txnId = transactionId || 'TXN_ADV_' + Math.floor(100000 + Math.random() * 900000);
    const amount = project.advanceAmount || Math.round((project.totalBudget || 25000) * 0.2);

    project.advancePaid = true;
    project.paymentHistory = project.paymentHistory || [];
    project.paymentHistory.unshift({
      id: 'pay_' + Date.now(),
      amount,
      type: 'Advance (20% Initial Booking)',
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      transactionId: txnId,
      orderId: orderId || `order_rec_${Date.now()}`,
      status: 'Completed',
    });

    return res.json({ success: true, message: '20% Advance payment confirmed! Your project workspace is now unlocked.', project });
  } catch {
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
  } catch {
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
    paymentHistory: advancePaid ? [{
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
  const { username, password } = req.body || {};
  if (username === 'admin261125@gmail.com' && password === 'admin261125@gmail.com') {
    const token = jwt.sign(
      { id: 'admin_root', role: 'admin', email: username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({ success: true, token });
  }

  return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
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
  createRazorpayOrder,
  verifyRazorpayPayment,
  addClientFeedback,
  getAdminProjects,
  updateAdminProject,
  createAdminProject,
  deleteAdminProject,
};
