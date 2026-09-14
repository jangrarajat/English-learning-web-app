import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDB } from './src/config/database.js';

// ==================== Load Environment Variables ====================
dotenv.config();

// ==================== Get Port from Environment ====================
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==================== Start Server Function ====================
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    // Start Express server
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

    // ==================== Graceful Shutdown ====================
    const gracefulShutdown = (signal) => {
      console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      // Don't exit in development for hot reload
      if (NODE_ENV === 'production') {
        server.close(() => process.exit(1));
      }
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      console.error('Shutting down...');
      server.close(() => process.exit(1));
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// ==================== Start the Server ====================
startServer();

// ==================== Export for Testing ====================
export default startServer;