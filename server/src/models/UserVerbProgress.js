import mongoose from 'mongoose';

const userVerbProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verbId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Verb',
    required: true
  },
  status: {
    type: String,
    enum: ['locked', 'learning', 'revising', 'learned', 'mastered'],
    default: 'locked'
  },
  masteryScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  wrongAnswers: {
    type: Number,
    default: 0
  },
  lastReviewedAt: {
    type: Date,
    default: null
  },
  nextReviewAt: {
    type: Date,
    default: null
  },
  timesSeen: {
    type: Number,
    default: 0
  },
  lastAnswerCorrect: {
    type: Boolean,
    default: true
  }
});

userVerbProgressSchema.index({ userId: 1, verbId: 1 }, { unique: true });

const UserVerbProgress = mongoose.model('UserVerbProgress', userVerbProgressSchema);
export default UserVerbProgress;