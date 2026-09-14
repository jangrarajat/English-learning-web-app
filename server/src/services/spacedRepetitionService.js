import UserVerbProgress from '../models/UserVerbProgress.js';

// ==================== Spaced Repetition Intervals (in days) ====================
const INTERVALS = {
  CORRECT: [1, 2, 4, 7, 14, 30],
  INCORRECT: 1,
  DEFAULT: 1
};

// ==================== @desc    Update spaced repetition schedule ====================
export const updateSpacedRepetition = async (progress, isCorrect) => {
  try {
    const now = new Date();
    let nextReview;

    if (isCorrect) {
      // Move to next interval
      const currentInterval = getCurrentInterval(progress);
      const nextIndex = Math.min(currentInterval + 1, INTERVALS.CORRECT.length - 1);
      const daysToAdd = INTERVALS.CORRECT[nextIndex];

      nextReview = new Date(now);
      nextReview.setDate(nextReview.getDate() + daysToAdd);
    } else {
      // Reset to shorter interval
      nextReview = new Date(now);
      nextReview.setDate(nextReview.getDate() + INTERVALS.INCORRECT);
    }

    return nextReview;
  } catch (error) {
    console.error('updateSpacedRepetition error:', error);
    // Fallback: review tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
};

// ==================== @desc    Get current interval index based on mastery ====================
const getCurrentInterval = (progress) => {
  const score = progress.masteryScore || 0;
  const correct = progress.correctAnswers || 0;

  // Base interval on mastery score
  if (score >= 90) return 5; // 30 days
  if (score >= 80) return 4; // 14 days
  if (score >= 70) return 3; // 7 days
  if (score >= 50) return 2; // 4 days
  if (score >= 30) return 1; // 2 days
  return 0; // 1 day
};

// ==================== @desc    Calculate next review date for a verb ====================
export const calculateNextReview = (masteryScore, timesReviewed = 0) => {
  const now = new Date();
  let daysToAdd = 1;

  if (masteryScore >= 90) {
    daysToAdd = 30;
  } else if (masteryScore >= 80) {
    daysToAdd = 14;
  } else if (masteryScore >= 70) {
    daysToAdd = 7;
  } else if (masteryScore >= 50) {
    daysToAdd = 4;
  } else if (masteryScore >= 30) {
    daysToAdd = 2;
  } else {
    daysToAdd = 1;
  }

  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + daysToAdd);
  return nextReview;
};

// ==================== @desc    Get verbs due for review ====================
export const getDueForReview = async (userId, limit = 20) => {
  try {
    const now = new Date();

    const dueProgress = await UserVerbProgress.find({
      userId,
      nextReviewAt: { $lte: now }
    })
      .populate('verbId', 'v1 v2 v3 meaning day')
      .sort({ nextReviewAt: 1 })
      .limit(limit);

    return dueProgress
      .filter(p => p.verbId)
      .map(p => ({
        ...p.verbId.toObject(),
        progress: {
          masteryScore: p.masteryScore,
          status: p.status,
          nextReviewAt: p.nextReviewAt,
          lastReviewedAt: p.lastReviewedAt
        }
      }));
  } catch (error) {
    console.error('getDueForReview error:', error);
    return [];
  }
};

// ==================== @desc    Update mastery after test ====================
export const updateMasteryAfterTest = async (userId, detailedQuestions) => {
  try {
    for (const q of detailedQuestions) {
      if (!q.verbId) continue;

      const progress = await UserVerbProgress.findOne({
        userId,
        verbId: q.verbId
      });

      if (!progress) continue;

      const now = new Date();

      if (q.isCorrect) {
        progress.correctAnswers = (progress.correctAnswers || 0) + 1;
        progress.masteryScore = Math.min(100, (progress.masteryScore || 0) + 3);
      } else {
        progress.wrongAnswers = (progress.wrongAnswers || 0) + 1;
        progress.masteryScore = Math.max(0, (progress.masteryScore || 0) - 2);
      }

      progress.timesSeen = (progress.timesSeen || 0) + 1;
      progress.lastReviewedAt = now;
      progress.lastAnswerCorrect = q.isCorrect;

      // Calculate next review
      progress.nextReviewAt = await updateSpacedRepetition(progress, q.isCorrect);

      // Update status
      progress.status = getStatusFromMastery(progress.masteryScore);

      await progress.save();
    }
  } catch (error) {
    console.error('updateMasteryAfterTest error:', error);
  }
};

// ==================== @desc    Get status from mastery score ====================
export const getStatusFromMastery = (score) => {
  if (score >= 90) return 'mastered';
  if (score >= 70) return 'learned';
  if (score >= 40) return 'learning';
  if (score > 0) return 'revising';
  return 'learning';
};

// ==================== @desc    Get mastery level info ====================
export const getMasteryLevel = (score) => {
  if (score >= 90) return { level: 'Mastered', color: 'green', emoji: '⭐' };
  if (score >= 70) return { level: 'Good', color: 'blue', emoji: '✅' };
  if (score >= 40) return { level: 'Learning', color: 'yellow', emoji: '📖' };
  return { level: 'Weak', color: 'red', emoji: '🔴' };
};

// ==================== @desc    Calculate optimal review schedule ====================
export const getReviewSchedule = (masteryScore) => {
  const intervals = [];

  if (masteryScore >= 90) {
    intervals.push(
      { day: 1, label: 'Tomorrow' },
      { day: 7, label: '1 week' },
      { day: 30, label: '1 month' }
    );
  } else if (masteryScore >= 70) {
    intervals.push(
      { day: 1, label: 'Tomorrow' },
      { day: 4, label: '4 days' },
      { day: 14, label: '2 weeks' }
    );
  } else {
    intervals.push(
      { day: 1, label: 'Tomorrow' },
      { day: 2, label: '2 days' },
      { day: 4, label: '4 days' }
    );
  }

  return intervals;
};

// ==================== @desc    Get review stats ====================
export const getReviewStats = async (userId) => {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueToday = await UserVerbProgress.countDocuments({
      userId,
      nextReviewAt: { $lte: now }
    });

    const dueTomorrow = await UserVerbProgress.countDocuments({
      userId,
      nextReviewAt: { $gt: now, $lte: tomorrow }
    });

    const totalTracked = await UserVerbProgress.countDocuments({ userId });

    const mastered = await UserVerbProgress.countDocuments({
      userId,
      masteryScore: { $gte: 90 }
    });

    return {
      dueToday,
      dueTomorrow,
      totalTracked,
      mastered
    };
  } catch (error) {
    console.error('getReviewStats error:', error);
    return { dueToday: 0, dueTomorrow: 0, totalTracked: 0, mastered: 0 };
  }
};

// ==================== Export intervals ====================
export { INTERVALS };