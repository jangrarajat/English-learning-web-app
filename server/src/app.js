import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path'
import { fileURLToPath } from 'url';
// ==================== Routes Imports ====================
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import verbRoutes from './routes/verbRoutes.js';
import practiceRoutes from './routes/practiceRoutes.js';
import testRoutes from './routes/testRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// ==================== Middleware Imports ====================
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== Load Environment Variables ====================
dotenv.config();

// ==================== Initialize Express App ====================
const app = express();

// ==================== Trust Proxy (for rate limiting behind proxies) ====================
app.set('trust proxy', 1);
// app.use(express.static(path.join(_dirname , 'public')))
app.use(express.static(path.join(__dirname, 'public')));

// ==================== Security Middleware ====================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.CLIENT_URL || 'http://localhost:5173']
    }
  },
  crossOriginEmbedderPolicy: false
}));

// ==================== CORS Configuration ====================
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    console.warn(`⚠️  CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
}));

// ==================== Compression Middleware ====================
app.use(compression({
  level: 6,
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client explicitly says not to
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// ==================== Body Parser Middleware ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== Cookie Parser Middleware ====================
app.use(cookieParser());

// ==================== Logging Middleware ====================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Production: log to combined format
  app.use(morgan('combined'));
}

// ==================== Rate Limiting ====================
app.use('/api', apiLimiter);

// ==================== Health Check Route ====================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: '🚀 Verb Challenge API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ==================== API Documentation Root ====================
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: '📚 30-Day English Verb Challenge API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      course: '/api/course',
      verbs: '/api/verbs',
      practice: '/api/practice',
      tests: '/api/tests',
      progress: '/api/progress',
      achievements: '/api/achievements',
      admin: '/api/admin'
    },
    documentation: 'See README.md for full API documentation'
  });
});

// ==================== API Routes ====================
app.use('/api/auth', authRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/verbs', verbRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/admin', adminRoutes);

// ==================== Root Route ====================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '📚 30-Day English Verb Challenge API',
    description: 'Learn 120 English verbs in 30 days',
    version: '1.0.0',
    status: 'Running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==================== 404 Handler ====================
app.use(notFound);

// ==================== Global Error Handler ====================
app.use(errorHandler);

// ==================== Export App ====================
export default app;