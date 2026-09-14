import mongoose from 'mongoose';
import Verb from '../models/Verb.js';
import { verbs } from './seedData.js';
import { connectDB, disconnectDB } from '../config/database.js';

// ==================== Seed Database ====================
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB (.env loaded by database.js)
    await connectDB();

    // Clear existing verbs
    const deleted = await Verb.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing verbs`);

    // Insert new verbs
    const inserted = await Verb.insertMany(verbs);
    console.log(`✅ Inserted ${inserted.length} verbs`);

    // Verify
    const total = await Verb.countDocuments();
    const days = await Verb.distinct('day');

    console.log('\n📊 Seeding Summary:');
    console.log(`   Total verbs: ${total}`);
    console.log(`   Days covered: ${days.length}`);

    console.log('\n📅 Verbs per day:');
    for (const day of days.sort((a, b) => a - b)) {
      const count = await Verb.countDocuments({ day });
      console.log(`   Day ${day}: ${count} verbs`);
    }

    console.log('\n🎉 Database seeded successfully!');

    // Disconnect and exit
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();