import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// ==================== Load Environment Variables ====================
dotenv.config();

// ==================== Force Public DNS (Fix for MongoDB Atlas DNS issues) ====================
// Google (8.8.8.8) aur Cloudflare (1.1.1.1) ke public DNS use karega
dns.setServers(['8.8.8.8', '1.1.1.1']);
console.log('🌐 DNS servers set to: 8.8.8.8, 1.1.1.1');

// ==================== Auto Seed Function ====================
const autoSeedIfEmpty = async () => {
  try {
    // Import karo (dynamic import to avoid circular dependency)
    const Verb = (await import('../models/Verb.js')).default;
    const { verbs } = await import('../utils/seedData.js');

    // Check karo database me already data hai ya nahi
    const existingCount = await Verb.countDocuments();

    if (existingCount > 0) {
      console.log(`📚 Database already has ${existingCount} verbs. Skipping seed.`);
      return;
    }

    console.log('🌱 Database is empty. Auto-seeding 120 verbs...');

    // Insert all verbs
    const inserted = await Verb.insertMany(verbs);
    console.log(`✅ Auto-seeded ${inserted.length} verbs successfully!`);

    // Show summary
    const days = await Verb.distinct('day');
    console.log(`📅 Days covered: ${days.length} (Day ${Math.min(...days)} to Day ${Math.max(...days)})`);
  } catch (error) {
    console.error(`⚠️  Auto-seed warning: ${error.message}`);
    // Don't exit - let the server continue
  }
};

// ==================== Connect to MongoDB ====================
export const connectDB = async () => {
  try {
    // Check MONGO_URI
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    console.log('📡 Connecting to MongoDB...');

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // ==================== Auto Seed (if empty) ====================
    await autoSeedIfEmpty();

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// ==================== Disconnect from MongoDB ====================
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error(`❌ MongoDB Disconnect Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;