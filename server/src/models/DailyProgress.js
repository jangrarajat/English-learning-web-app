import mongoose from 'mongoose';

const dailyProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  day: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    default: 0
  },
  tasksCompleted: {
    type: Number,
    default: 0
  },
  totalTasks: {
    type: Number,
    default: 5
  },
  verbsReviewed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Verb'
  }],
  completedAt: {
    type: Date,
    default: null
  }
});

dailyProgressSchema.index({ userId: 1, day: 1 }, { unique: true });

const DailyProgress = mongoose.model('DailyProgress', dailyProgressSchema);
export default DailyProgress;