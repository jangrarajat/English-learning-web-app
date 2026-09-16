import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDB } from './src/config/database.js';

// ==================== Load Environment Variables ====================
dotenv.config();

// ==================== Get Port from Environment ====================
const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==================== Start Server Function ====================
const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    const server = app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════');
      console.log('🚀 30-Day English Verb Challenge API');
      console.log('═══════════════════════════════════════════════');
      console.log(`📍 Environment: ${NODE_ENV}`);
      console.log(`🌐 Server URL:  http://localhost:${PORT}`);
      console.log(`📚 API Base:    http://localhost:${PORT}/api`);
      console.log(`❤️  Health:      http://localhost:${PORT}/api/health`);
      console.log('═══════════════════════════════════════════════');
      console.log('');
    });

    const gracefulShutdown = (signal) => {
      console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

startServer();

export default startServer;