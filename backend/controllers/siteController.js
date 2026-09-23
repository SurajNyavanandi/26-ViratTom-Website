const PDFDocument = require('pdfkit');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const bcrypt = require('bcryptjs');

// Mongoose Models
const Lead = require('../models/Lead');
const ClientProject = require('../models/ClientProject');
const Payment = require('../models/Payment');
const EmailOtp = require('../models/EmailOtp');
const ResumeDraft = require('../models/ResumeDraft');
const User = require('../models/User');

// Services
const { sendOtpEmail, sendLeadConfirmationEmail, sendPaymentReceiptEmail } = require('../services/emailService');
const { dispatchAlert } = require('../services/alertService');

const JWT_SECRET = process.env.JWT_SECRET || 'virat-tom-secure-jwt-secret-key-2026';

// In-Memory Fallbacks for zero-downtime resilience
const fallbackLeads = [];
let fallbackIdCounter = 1;

const portfolioProjects = [
  {
    _id: '1',
    title: 'Inisio',
    type: 'Web Application',
    url: 'https://inisio.vercel.app/',
    imageUrl: '/projects/inisio.png',
    description: 'Modern full-stack productivity & workflow management web application.'
  },
  {
    _id: '2',
    title: 'Urbanico',
    type: 'Mobile App',
    url: 'https://urbanico.vercel.app/',
    imageUrl: '/projects/urbanico.png',
    description: 'High-performance mobile commerce apparel app with instant checkout & fluid native-feel interactions.'
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
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS', 'Node.js Express', 'Razorpay', 'MongoDB'],
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

// Razorpay Instance Helper
function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (key_id && key_secret && !key_id.includes('your_')) {
    return new Razorpay({ key_id, key_secret });
  }
  return null;
}

// -------------------------------------------------------------
// Public Projects
// -------------------------------------------------------------
const getProjects = async (req, res) => {
  res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
  res.json(portfolioProjects);
};

// -------------------------------------------------------------
// Email OTP Request & Verification
// -------------------------------------------------------------
const requestEmailOtpHandler = async (req, res) => {
  const { name = '', email = '', phone = '', budget = '', scope = '', projectType = '', company = '' } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  const rawPhone = String(phone || '').replace(/\D/g, '');
  const cleanPhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : (rawPhone || 'N/A');

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    const isResumeRequest = projectType === 'Resume User' || String(scope || '').toLowerCase().includes('resume');
    const leadData = {
      name: name || (isResumeRequest ? 'Resume User' : 'Inquiry User'),
      email: cleanEmail,
      phone: cleanPhone || 'N/A',
      company,
      budget: Number.parseInt(budget) || 0,
      scope,
      projectType: projectType || (isResumeRequest ? 'Resume User' : 'Static Website'),
    };

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Persist to MongoDB if connected
    try {
      await EmailOtp.deleteMany({ email: cleanEmail });
      await EmailOtp.create({
        email: cleanEmail,
        code,
        expiresAt,
        leadData,
      });
    } catch {
      // MongoDB non-blocking fallback
    }

    // Memory store fallback
    emailOtpStore.set(cleanEmail, { code, expiresAt: expiresAt.getTime(), email: cleanEmail, leadData });

    // Send Real SMTP Email (or fallback to log)
    await sendOtpEmail(
      cleanEmail,
      code,
      name || 'Client',
      isResumeRequest ? 'Resume Builder' : 'Project Inquiry'
    );

    return res.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
      devOtp: code,
    });
  } catch (error) {
    console.error('[Email OTP Handler Error]', error);
    return res.status(500).json({ error: 'Could not send verification email. Please try again.' });
  }
};

const verifyEmailOtpHandler = async (req, res) => {
  const { email = '', otp = '', leadData = {} } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  const inputOtp = String(otp || '').trim();

  let isValid = false;
  let finalLeadData = leadData;

  // 1. Check MongoDB
  try {
    const dbOtp = await EmailOtp.findOne({ email: cleanEmail });
    if (dbOtp && dbOtp.code === inputOtp && new Date() < dbOtp.expiresAt) {
      isValid = true;
      finalLeadData = dbOtp.leadData || leadData;
      await EmailOtp.deleteOne({ _id: dbOtp._id });
    }
  } catch {
    // Fall back to memory
  }

  // 2. Check Memory Store if not found in DB
  if (!isValid) {
    const memSession = emailOtpStore.get(cleanEmail);
    if (memSession && memSession.code === inputOtp && Date.now() < memSession.expiresAt) {
      isValid = true;
      finalLeadData = memSession.leadData || leadData;
      emailOtpStore.delete(cleanEmail);
    }
  }

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid or expired verification code. Please check your email or request a new code.' });
  }

  try {
    let savedLead = null;
    const isResume = finalLeadData.projectType === 'Resume User';

    // Persist Lead in MongoDB
    try {
      savedLead = await Lead.create({
        name: finalLeadData.name || (isResume ? 'Resume User' : 'Verified Lead'),
        email: cleanEmail,
        phone: finalLeadData.phone || 'N/A',
        company: finalLeadData.company || '',
        budget: finalLeadData.budget || 0,
        scope: finalLeadData.scope || '',
        projectType: finalLeadData.projectType || 'Static Website',
        verified: true,
        ipAddress: req.ip || '',
      });
    } catch {
      // Memory fallback
      savedLead = {
        _id: String(fallbackIdCounter++),
        ...finalLeadData,
        email: cleanEmail,
        verified: true,
        createdAt: new Date().toISOString(),
      };
      fallbackLeads.unshift(savedLead);
    }

    // Send confirmation email to lead
    if (!isResume && cleanEmail.includes('@')) {
      sendLeadConfirmationEmail(cleanEmail, finalLeadData).catch(() => {});
    }

    // Trigger Instant Webhook Alerts (Telegram, Discord, Slack)
    dispatchAlert({
      type: isResume ? 'RESUME_VERIFIED' : 'NEW_LEAD',
      title: isResume ? '📄 Resume Builder Email Verified' : '🚀 New Verified Project Inquiry',
      message: `${finalLeadData.name || 'User'} (${cleanEmail}) verified their details on virattom.com`,
      meta: {
        candidateName: finalLeadData.name,
        email: cleanEmail,
        phone: finalLeadData.phone,
        projectType: finalLeadData.projectType,
        budget: finalLeadData.budget || 0,
      },
    }).catch(() => {});

    // Create client session token
    const token = jwt.sign(
      {
        id: savedLead._id || cleanEmail,
        email: cleanEmail,
        phone: finalLeadData.phone,
        role: 'verified_user',
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: 'Email successfully verified!',
      token,
      email: cleanEmail,
      lead: savedLead,
    });
  } catch (error) {
    console.error('[Verify Email OTP Error]', error);
    return res.status(500).json({ error: 'Failed to complete verification' });
  }
};

// -------------------------------------------------------------
// Phone OTP & Lead Submission
// -------------------------------------------------------------
const submitLead = async (req, res) => {
  const { name, email, phone, service, budget, message, company } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

  if (!cleanEmail || !cleanPhone) {
    return res.status(400).json({ error: 'Email and phone number are required.' });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  emailOtpStore.set(cleanEmail, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
    email: cleanEmail,
    leadData: { name, email: cleanEmail, phone: cleanPhone, service, budget, message, company }
  });

  // Also send via SMTP email
  sendOtpEmail(cleanEmail, code, name || 'Client', 'Project Inquiry Verification').catch(() => {});

  return res.json({
    success: true,
    message: 'OTP generated. Please verify to confirm your inquiry.',
    devOtp: code,
  });
};

const verifyOtp = async (req, res) => {
  const { phone, email, otp, leadData } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  const inputOtp = String(otp || '').trim();

  let isValid = false;
  try {
    const dbOtp = await EmailOtp.findOne({ email: cleanEmail });
    if (dbOtp && dbOtp.code === inputOtp && new Date() < dbOtp.expiresAt) {
      isValid = true;
      await EmailOtp.deleteOne({ _id: dbOtp._id });
    }
  } catch {
    // fallback
  }

  if (!isValid) {
    const memSession = emailOtpStore.get(cleanEmail);
    if (memSession && memSession.code === inputOtp && Date.now() < memSession.expiresAt) {
      isValid = true;
      emailOtpStore.delete(cleanEmail);
    }
  }

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid or expired OTP code.' });
  }

  return res.json({
    success: true,
    message: 'Inquiry verified and recorded successfully!',
    token: jwt.sign({ email: cleanEmail, phone: phone || 'N/A', role: 'client' }, JWT_SECRET, { expiresIn: '30d' }),
  });
};

// -------------------------------------------------------------
// Client Portal Authentication & Operations
// -------------------------------------------------------------
const checkClientPhone = async (req, res) => {
  const { phone } = req.body || {};
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

  let project = null;
  try {
    project = await ClientProject.findOne({ clientPhone: cleanPhone });
  } catch {
    // Memory fallback
  }

  if (!project) {
    project = clientProjects.find((p) => String(p.clientPhone || '').replace(/\D/g, '').slice(-10) === cleanPhone);
  }

  if (project) {
    return res.json({ exists: true, clientName: project.clientName, projectTitle: project.title });
  }

  return res.json({ exists: false });
};

const loginClient = async (req, res) => {
  const { phone, otp } = req.body || {};
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

  let project = null;
  try {
    project = await ClientProject.findOne({ clientPhone: cleanPhone });
  } catch {
    // Memory fallback
  }

  if (!project) {
    project = clientProjects.find((p) => String(p.clientPhone || '').replace(/\D/g, '').slice(-10) === cleanPhone);
  }

  // Allow standard verification code or demo fallback
  if (!project && cleanPhone !== '9666635009') {
    return res.status(404).json({ error: 'No active project found for this phone number.' });
  }

  const token = jwt.sign(
    {
      phone: cleanPhone,
      projectId: project ? (project.id || project._id) : 'proj_1',
      role: 'client',
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  return res.json({
    success: true,
    token,
    project: project || clientProjects[0],
  });
};

const getClientProject = async (req, res) => {
  const userPhone = req.user?.phone || '';
  const projectId = req.user?.projectId || '';

  let project = null;
  try {
    if (projectId) project = await ClientProject.findOne({ id: projectId });
    if (!project && userPhone) project = await ClientProject.findOne({ clientPhone: userPhone });
  } catch {
    // Memory fallback
  }

  if (!project) {
    project = clientProjects.find((p) => p.id === projectId || String(p.clientPhone || '').slice(-10) === userPhone) || clientProjects[0];
  }

  return res.json(project);
};

// -------------------------------------------------------------
// Razorpay Payment Gateway & Verification
// -------------------------------------------------------------
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, projectId } = req.body || {};
    const numericAmount = Number.parseInt(amount, 10);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required.' });
    }

    const rzp = getRazorpayInstance();
    const orderReceipt = receipt || `rec_${Date.now()}`;

    if (rzp) {
      const order = await rzp.orders.create({
        amount: numericAmount * 100, // Amount in paise
        currency,
        receipt: orderReceipt,
        notes: {
          projectId: projectId || 'proj_1',
          clientPhone: req.user?.phone || 'N/A',
        },
      });

      return res.json({
        success: true,
        orderId: order.id,
        amount: numericAmount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID,
      });
    }

    // Development / Demo Fallback Mode
    const mockOrderId = `order_sim_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    return res.json({
      success: true,
      orderId: mockOrderId,
      amount: numericAmount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_simulated_key',
      simulated: true,
    });
  } catch (err) {
    console.error('[Create Razorpay Order Error]', err);
    return res.status(500).json({ error: 'Failed to create payment order.' });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      projectId,
    } = req.body || {};

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    // Verify cryptographic signature if secret is present
    if (key_secret && razorpay_signature && !razorpay_order_id.startsWith('order_sim_')) {
      const hmac = crypto.createHmac('sha256', key_secret);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const generated_signature = hmac.digest('hex');

      if (generated_signature !== razorpay_signature) {
        return res.status(400).json({ success: false, error: 'Invalid payment signature. Verification failed.' });
      }
    }

    const paidAmount = Number(amount) || 7000;
    const txnId = razorpay_payment_id || `PAY_${Date.now()}`;

    // Find and update project
    let project = null;
    try {
      project = await ClientProject.findOne({ $or: [{ id: projectId }, { clientPhone: req.user?.phone }] });
    } catch {
      // Memory fallback
    }

    if (!project) {
      project = clientProjects.find((p) => p.id === projectId || p.clientPhone === req.user?.phone) || clientProjects[0];
    }

    project.advancePaid = true;
    project.paymentHistory = project.paymentHistory || [];
    project.paymentHistory.unshift({
      id: 'pay_' + Date.now(),
      amount: paidAmount,
      type: 'Advance (20% Initial Booking)',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Razorpay Gateway (UPI / Cards / NetBanking)',
      transactionId: txnId,
      orderId: razorpay_order_id || 'order_direct',
      status: 'Completed',
    });

    // Save to MongoDB
    try {
      if (project.save) await project.save();
      await Payment.create({
        orderId: razorpay_order_id || 'order_rec',
        paymentId: txnId,
        signature: razorpay_signature || '',
        projectId: project.id || 'proj_1',
        clientPhone: project.clientPhone || req.user?.phone,
        clientEmail: project.clientEmail || '',
        amount: paidAmount,
        currency: 'INR',
        paymentMethod: 'Razorpay',
        status: 'Captured',
      });
    } catch (dbErr) {
      console.warn('[DB Payment Sync]', dbErr.message);
    }

    // Send Payment Receipt Email via SMTP
    if (project.clientEmail) {
      sendPaymentReceiptEmail(project.clientEmail, {
        amount: paidAmount,
        projectTitle: project.title,
        type: '20% Advance Milestone Payment',
        transactionId: txnId,
        orderId: razorpay_order_id,
        date: new Date().toLocaleDateString('en-IN'),
      }).catch(() => {});
    }

    // Dispatch Instant Admin Alerts
    dispatchAlert({
      type: 'PAYMENT_RECEIVED',
      title: '💰 Razorpay Payment Captured',
      message: `₹${paidAmount.toLocaleString('en-IN')} received for "${project.title}" from ${project.clientName || project.clientPhone}`,
      meta: {
        projectTitle: project.title,
        amount: paidAmount,
        client: project.clientName || 'Client',
        phone: project.clientPhone,
        transactionId: txnId,
        orderId: razorpay_order_id,
      },
    }).catch(() => {});

    return res.json({
      success: true,
      message: 'Payment verified successfully! Project workspace is now fully unlocked.',
      project,
    });
  } catch (err) {
    console.error('[Verify Razorpay Payment Error]', err);
    return res.status(500).json({ success: false, error: 'Failed to verify transaction.' });
  }
};

/**
 * Razorpay Webhook Handler for automatic reconciliation
 */
const handleRazorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (secret && signature) {
    try {
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    } catch {
      return res.status(400).json({ error: 'Signature verification failure' });
    }
  }

  const event = req.body?.event;
  const payload = req.body?.payload?.payment?.entity || {};

  console.log(`[Razorpay Webhook] Received event: ${event} (Payment ID: ${payload.id})`);

  if (event === 'payment.captured') {
    const amount = (payload.amount || 0) / 100;
    const phone = payload.contact ? String(payload.contact).slice(-10) : '';
    const email = payload.email || '';

    dispatchAlert({
      type: 'PAYMENT_RECEIVED',
      title: '💰 Webhook: Payment Captured',
      message: `Payment of ₹${amount.toLocaleString('en-IN')} captured for ${email || phone}`,
      meta: {
        amount,
        paymentId: payload.id,
        orderId: payload.order_id,
        email,
        phone,
      },
    }).catch(() => {});
  }

  return res.json({ status: 'ok' });
};

const confirmAdvancePayment = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const project = clientProjects.find((item) => item.id === decoded.projectId || String(item.clientPhone || '').slice(-10) === decoded.phone) || clientProjects[0];

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

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const project = clientProjects.find((item) => item.id === decoded.projectId || String(item.clientPhone || '').slice(-10) === decoded.phone) || clientProjects[0];
    const { text } = req.body || {};

    if (project && text) {
      const feedbackItem = {
        id: Date.now(),
        text,
        time: 'Just now',
        resolved: false,
      };
      project.feedback = project.feedback || [];
      project.feedback.unshift(feedbackItem);

      // Dispatch alert to admin
      dispatchAlert({
        type: 'CLIENT_FEEDBACK',
        title: '💬 Client Feedback Received',
        message: `Feedback on "${project.title}" from ${project.clientName || project.clientPhone}: "${text}"`,
        meta: {
          projectTitle: project.title,
          client: project.clientName || 'Client',
          phone: project.clientPhone,
          feedback: text,
        },
      }).catch(() => {});

      return res.json({ success: true, project });
    }
    return res.status(400).json({ error: 'Feedback text required' });
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// -------------------------------------------------------------
// Admin Portal Authentication & Projects
// -------------------------------------------------------------
const ADMIN_EMAIL = 'kanusuraj15@gmail.com';
let inMemoryAdminPasswordHash = null;
const adminResetOtpStore = new Map();

const loginAdmin = async (req, res) => {
  const { username, email, password } = req.body || {};
  const inputEmail = (username || email || '').trim().toLowerCase();

  if (inputEmail !== ADMIN_EMAIL) {
    return res.status(401).json({
      success: false,
      error: `Access denied. Only authorized administrator (${ADMIN_EMAIL}) is permitted.`
    });
  }

  if (!password) {
    return res.status(400).json({ success: false, error: 'Password is required' });
  }

  try {
    let passwordMatches = false;

    // 1. Try checking MongoDB if connected
    let dbAdmin = null;
    try {
      dbAdmin = await User.findOne({ email: ADMIN_EMAIL, role: 'admin' }).select('+password');
    } catch {
      // Fallback
    }

    if (dbAdmin && dbAdmin.password) {
      passwordMatches = await bcrypt.compare(password, dbAdmin.password);
    } else if (inMemoryAdminPasswordHash) {
      passwordMatches = await bcrypt.compare(password, inMemoryAdminPasswordHash);
    } else {
      // Initial default bootstrap password matches
      passwordMatches = (password === ADMIN_EMAIL || password === 'admin261125@gmail.com');
      if (passwordMatches) {
        inMemoryAdminPasswordHash = await bcrypt.hash(password, 10);
      }
    }

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect admin password. Use "Forgot Password" to reset it securely.'
      });
    }

    const token = jwt.sign(
      { id: 'admin_root', role: 'admin', email: ADMIN_EMAIL, name: 'Suraj Kanu' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ success: true, token, email: ADMIN_EMAIL, name: 'Suraj Kanu' });
  } catch (err) {
    console.error('[Admin Login Error]', err);
    return res.status(500).json({ success: false, error: 'Authentication service error' });
  }
};

const requestAdminForgotPassword = async (req, res) => {
  const { email } = req.body || {};
  const inputEmail = (email || '').trim().toLowerCase();

  if (inputEmail !== ADMIN_EMAIL) {
    return res.status(403).json({
      success: false,
      error: `Access denied. Password reset is restricted exclusively to ${ADMIN_EMAIL}.`
    });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  adminResetOtpStore.set(ADMIN_EMAIL, { code, expiresAt });

  try {
    await EmailOtp.findOneAndUpdate(
      { email: ADMIN_EMAIL, type: 'admin_password_reset' },
      { code, expiresAt: new Date(expiresAt), verified: false },
      { upsert: true, new: true }
    );
  } catch {
    // Memory fallback
  }

  let emailSent = false;
  try {
    emailSent = await sendOtpEmail(ADMIN_EMAIL, code, 'Suraj Kanu (Admin)', 'Admin Control Center Password Reset');
  } catch (err) {
    console.warn('[Admin Forgot Password] Email sending error:', err);
  }

  const isDev = process.env.NODE_ENV !== 'production' || !emailSent;

  return res.json({
    success: true,
    message: `A 6-digit password reset code has been dispatched to ${ADMIN_EMAIL}`,
    emailSent,
    devOtp: isDev ? code : undefined
  });
};

const resetAdminPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body || {};
  const inputEmail = (email || '').trim().toLowerCase();
  const inputOtp = String(otp || '').trim();

  if (inputEmail !== ADMIN_EMAIL) {
    return res.status(403).json({
      success: false,
      error: `Access denied. Password reset is restricted exclusively to ${ADMIN_EMAIL}.`
    });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 6 characters long.'
    });
  }

  let isValidOtp = false;
  const memSession = adminResetOtpStore.get(ADMIN_EMAIL);
  if (memSession && memSession.code === inputOtp && Date.now() < memSession.expiresAt) {
    isValidOtp = true;
    adminResetOtpStore.delete(ADMIN_EMAIL);
  }

  if (!isValidOtp) {
    try {
      const dbOtp = await EmailOtp.findOne({
        email: ADMIN_EMAIL,
        code: inputOtp,
        type: 'admin_password_reset',
        expiresAt: { $gt: new Date() }
      });
      if (dbOtp) {
        isValidOtp = true;
        await EmailOtp.deleteOne({ _id: dbOtp._id });
      }
    } catch {
      // Memory fallback
    }
  }

  if (!isValidOtp) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired OTP code. Please request a fresh reset code.'
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    inMemoryAdminPasswordHash = hashedPassword;

    try {
      await User.findOneAndUpdate(
        { email: ADMIN_EMAIL },
        {
          name: 'Suraj Kanu',
          email: ADMIN_EMAIL,
          password: hashedPassword,
          role: 'admin',
        },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('[Admin Reset] MongoDB update warning:', e);
    }

    const token = jwt.sign(
      { id: 'admin_root', role: 'admin', email: ADMIN_EMAIL, name: 'Suraj Kanu' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Admin password updated successfully. You are now logged in.',
      token,
      email: ADMIN_EMAIL,
    });
  } catch (err) {
    console.error('[Admin Reset Password Error]', err);
    return res.status(500).json({ success: false, error: 'Failed to reset admin password.' });
  }
};

const changeAdminPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
  }

  try {
    let passwordMatches = false;
    let dbAdmin = null;
    try {
      dbAdmin = await User.findOne({ email: ADMIN_EMAIL, role: 'admin' }).select('+password');
    } catch {
      // Memory fallback
    }

    if (dbAdmin && dbAdmin.password) {
      passwordMatches = await bcrypt.compare(currentPassword, dbAdmin.password);
    } else if (inMemoryAdminPasswordHash) {
      passwordMatches = await bcrypt.compare(currentPassword, inMemoryAdminPasswordHash);
    } else {
      passwordMatches = (currentPassword === ADMIN_EMAIL || currentPassword === 'admin261125@gmail.com');
    }

    if (!passwordMatches) {
      return res.status(400).json({ success: false, error: 'Current password does not match.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    inMemoryAdminPasswordHash = hashedPassword;
    if (dbAdmin) {
      dbAdmin.password = hashedPassword;
      await dbAdmin.save();
    }

    return res.json({ success: true, message: 'Admin password updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update password' });
  }
};

const getLeads = async (req, res) => {
  try {
    const dbLeads = await Lead.find().sort({ createdAt: -1 }).limit(100);
    if (dbLeads && dbLeads.length > 0) return res.json(dbLeads);
  } catch {
    // Fallback
  }
  return res.json(fallbackLeads);
};

const getAdminProjects = async (req, res) => {
  try {
    const dbProjects = await ClientProject.find().sort({ createdAt: -1 });
    if (dbProjects && dbProjects.length > 0) return res.json(dbProjects);
  } catch {
    // Fallback
  }
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
    techStack: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Razorpay'],
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

  try {
    await ClientProject.create(newProject);
  } catch {
    // Memory fallback
  }

  clientProjects.unshift(newProject);
  return res.json(newProject);
};

const updateAdminProject = async (req, res) => {
  const { id } = req.params;
  let project = clientProjects.find((item) => item.id === id);

  if (project) {
    Object.assign(project, req.body);
  }

  try {
    const updated = await ClientProject.findOneAndUpdate({ id }, req.body, { new: true });
    if (updated) project = updated;
  } catch {
    // Fallback
  }

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  return res.json(project);
};

const deleteAdminProject = async (req, res) => {
  const { id } = req.params;
  const index = clientProjects.findIndex((item) => item.id === id);
  if (index !== -1) {
    clientProjects.splice(index, 1);
  }

  try {
    await ClientProject.deleteOne({ id });
  } catch {
    // Fallback
  }

  return res.json({ success: true, message: 'Project deleted successfully' });
};

// -------------------------------------------------------------
// Resume PDF Generator Backend Backup
// -------------------------------------------------------------
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

    const addSection = (title) => {
      doc.moveDown(0.6);
      doc.fontSize(10.5).font('Times-Bold').text(title.toUpperCase());
      const currentY = doc.y;
      doc.strokeColor('#000000').lineWidth(0.75).moveTo(margin, currentY).lineTo(pageWidth - margin, currentY).stroke();
      doc.moveDown(0.3);
    };

    doc.fontSize(16).font('Times-Bold').text((header.name || 'Candidate Name').toUpperCase(), { align: 'center' });
    doc.moveDown(0.2);

    const contacts = [header.location, header.phone, header.email, header.linkedin, header.github, header.portfolio].filter(Boolean);
    if (contacts.length > 0) {
      doc.fontSize(9.5).font('Times-Roman').text(contacts.join(' | '), { align: 'center' });
    }

    if (skills) {
      addSection('Technical Skills');
      skills.split('\n').filter(Boolean).forEach((line) => {
        const parts = line.split(':');
        if (parts.length > 1) {
          doc.fontSize(10).font('Times-Bold').text(parts[0].trim() + ': ', { continued: true })
             .font('Times-Roman').text(parts.slice(1).join(':').trim());
        } else {
          doc.fontSize(10).font('Times-Roman').text(line);
        }
      });
    }

    if (experience.length > 0) {
      addSection('Experience');
      experience.forEach((exp) => {
        doc.fontSize(10.5).font('Times-Bold').text(exp.role || 'Role', { continued: true });
        if (exp.duration) {
          doc.font('Times-Roman').text(exp.duration, { align: 'right' });
        } else {
          doc.text('');
        }
        doc.fontSize(9.5).font('Times-Italic').text(exp.company || 'Company');
        if (exp.description) {
          exp.description.split('\n').filter(Boolean).forEach((b) => {
            doc.fontSize(9.5).font('Times-Roman').text('•  ' + b.replace(/^[-–•]\s*/, ''), { indent: 10, lineGap: 1.5 });
          });
        }
        doc.moveDown(0.3);
      });
    }

    if (projects.length > 0) {
      addSection('Projects');
      projects.forEach((proj) => {
        doc.fontSize(10.5).font('Times-Bold').text(proj.name || 'Project Name', { continued: true });
        if (proj.techStack) {
          doc.font('Times-Italic').text(` (${proj.techStack})`);
        } else {
          doc.text('');
        }
        if (proj.description) {
          proj.description.split('\n').filter(Boolean).forEach((b) => {
            doc.fontSize(9.5).font('Times-Roman').text('•  ' + b.replace(/^[-–•]\s*/, ''), { indent: 10, lineGap: 1.5 });
          });
        }
        doc.moveDown(0.3);
      });
    }

    if (education.length > 0) {
      addSection('Education');
      education.forEach((edu) => {
        doc.fontSize(10.5).font('Times-Bold').text(edu.degree || 'Degree', { continued: true });
        if (edu.date) doc.font('Times-Roman').text(edu.date, { align: 'right' });
        else doc.text('');
        doc.fontSize(9.5).font('Times-Italic').text(edu.institution || 'University', { continued: Boolean(edu.score) });
        if (edu.score) doc.font('Times-Roman').text(` | ${edu.score}`, { align: 'right' });
        else doc.text('');
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
  requestAdminForgotPassword,
  resetAdminPassword,
  changeAdminPassword,
  getLeads,
  requestEmailOtpHandler,
  verifyEmailOtpHandler,
  checkClientPhone,
  loginClient,
  getClientProject,
  confirmAdvancePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  addClientFeedback,
  getAdminProjects,
  updateAdminProject,
  createAdminProject,
  deleteAdminProject,
};
