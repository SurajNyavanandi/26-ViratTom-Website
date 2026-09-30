// Force IPv4-first DNS resolution to prevent ENETUNREACH errors on cloud container platforms (Render, Docker)
const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

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
const { runStartupDiagnostics } = require('./utils/diagnostics');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust reverse proxy (Google Cloud Run / Nginx)
app.set('trust proxy', 1);

// Initialize Database Connection
const dbPromise = connectDB();

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

// Database offline / Mongoose error fallback middleware
app.use((err, req, res, next) => {
  if (
    err.name === 'MongooseError' ||
    err.name === 'MongoNetworkError' ||
    (err.message && err.message.includes('buffering timed out'))
  ) {
    console.warn('[AI Studio] Database offline — returning mock response');
    if (req.method === 'GET') {
      return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
    }
    return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' });
  }
  next(err);
});

const fs = require('fs');
const http = require('http');
const frontendDir = path.resolve(__dirname, '../frontend');
const distDir = path.resolve(frontendDir, 'dist');

const httpServer = http.createServer(app);

async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true';

  if (!isProd) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        root: frontendDir,
        server: {
          middlewareMode: true,
          hmr: {
            server: httpServer,
          },
        },
        appType: 'spa',
      });

      if (vite.ws && typeof vite.ws.on === 'function') {
        vite.ws.on('error', () => {
          // Ignore WebSocket errors per environment constraints
        });
      }

      app.use(vite.middlewares);

      app.use(async (req, res, next) => {
        if (req.method !== 'GET' || req.originalUrl.startsWith('/api')) {
          return next();
        }
        try {
          let template = fs.readFileSync(path.resolve(frontendDir, 'index.html'), 'utf-8');
          template = await vite.transformIndexHtml(req.originalUrl, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e) {
          vite.ssrFixStacktrace(e);
          next(e);
        }
      });
    } catch (err) {
      console.warn('Failed to start Vite dev middleware, serving static files if built:', err.message);
      serveStaticFiles();
    }
  } else {
    serveStaticFiles();
  }

  function serveStaticFiles() {
    app.use(express.static(distDir));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.originalUrl.startsWith('/api')) {
        return next();
      }
      const indexFile = path.resolve(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        next();
      }
    });
  }

  // 404 and Global Error Handling for unhandled routes
  app.use(notFoundHandler);
  app.use(errorHandler);

  // Start server
  if (process.env.NODE_ENV !== 'test') {
    httpServer.listen(PORT, '0.0.0.0', async () => {
      console.log(`Server listening on port ${PORT} (0.0.0.0)`);
      try {
        const dbResult = await dbPromise;
        await runStartupDiagnostics({ dbResult, corsOrigins: allowedOrigins, port: PORT });
      } catch (err) {
        console.warn('Diagnostics notice:', err.message);
      }
    });
  }
}

setupServer();

module.exports = app;
