import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badge: {
    type: String,
    enum: [
      '7_day_streak',
      '30_verbs_learned',
      'first_weekly_test',
      'perfect_score',
      '60_verbs',
      '120_verbs',
      '30_day_challenge'
    ],
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  }
});

achievementSchema.index({ userId: 1, badge: 1 }, { unique: true });

const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;