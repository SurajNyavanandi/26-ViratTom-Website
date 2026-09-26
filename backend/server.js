const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('./config/db');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (Google Cloud Run / Nginx)
app.set('trust proxy', 1);

// Initialize Database Connection
connectDB();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// High-performance gzip response compression
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1',
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api', limiter);

// CORS Configuration from process.env.CORS_ORIGIN
const envOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const localDevOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

const allowedOrigins = Array.from(new Set([...envOrigins, ...localDevOrigins]));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Check allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow any localhost port (Vite, Next, custom dev servers)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // Allow virattom.com and all subdomains
    if (/^https?:\/\/([a-zA-Z0-9-]+\.)*virattom\.com$/.test(origin)) {
      return callback(null, true);
    }

    // Allow virattom.vercel.app and Vercel preview deployments
    if (/^https?:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Allow Google Cloud Run / AI Studio preview URLs
    if (/^https?:\/\/([a-zA-Z0-9-]+\.)*run\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Optional CORS_ORIGIN env var support
    if (process.env.CORS_ORIGIN && (process.env.CORS_ORIGIN === '*' || process.env.CORS_ORIGIN.split(',').includes(origin))) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiRoutes);

// 404 and Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0');
}

module.exports = app;
