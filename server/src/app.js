import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
// Import your routes
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import verbRoutes from './routes/verbRoutes.js';
import practiceRoutes from './routes/practiceRoutes.js';
import testRoutes from './routes/testRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import {errorHandler} from './middleware/errorHandler.js';

// Setup __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== Initialize App ====================
const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(cookieParser());
// ==================== API Routes ====================
app.use('/api/auth', authRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/verbs', verbRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/admin', adminRoutes);

// ==================== Frontend Static Files Setup ====================
// Docker container ke andar server/public folder ko point karne ke liye
const frontendDistPath = path.join(__dirname, '../public');

app.use(express.static(frontendDistPath));

// ==================== SPA Catch-All Route ====================
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

// ==================== Global Error Handler ====================
app.use(errorHandler);

export default app;