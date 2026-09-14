// ==================== Central Service Exports ====================

// Course service
export * as courseService from './courseService.js';

// Streak service
export * as streakService from './streakService.js';

// Gamification service
export * as gamificationService from './gamificationService.js';

// Test service
export * as testService from './testService.js';

// Practice service
export * as practiceService from './practiceService.js';

// Spaced repetition service
export * as spacedRepetitionService from './spacedRepetitionService.js';

// ==================== Re-export commonly used functions ====================

// Course
export {
  canAccessDay,
  isDayCompleted,
  getDayProgress,
  getCurrentUnlockedDay,
  getCourseCompletion,
  isCourseComplete,
  getDayType,
  getNextMilestone,
  isValidDay,
  areAllPreviousDaysComplete
} from './courseService.js';

// Streak
export {
  updateStreak,
  getStreak,
  checkStreakStatus,
  resetStreak,
  getStreakMilestone,
  getStreakLevel
} from './streakService.js';

// Gamification
export {
  addXP,
  calculateLevel,
  getLevelInfo,
  checkAchievements,
  checkPerfectScore,
  awardDayXP,
  awardTestXP,
  awardPracticeXP,
  getUserLevel,
  getXPToNextLevel,
  getAllBadgesWithStatus,
  XP_VALUES,
  LEVEL_THRESHOLDS
} from './gamificationService.js';

// Test
export {
  generateTestQuestions,
  calculateScore,
  getTestResultMessage,
  extractWeakVerbs,
  QUESTION_TYPES,
  shuffleArray
} from './testService.js';

// Practice
export {
  generatePracticeQuestions,
  calculatePracticeScore,
  getPracticeRecommendations,
  getPracticeTypeLabel
} from './practiceService.js';

// Spaced Repetition
export {
  updateSpacedRepetition,
  calculateNextReview,
  getDueForReview,
  updateMasteryAfterTest,
  getStatusFromMastery,
  getMasteryLevel,
  getReviewSchedule,
  getReviewStats,
  INTERVALS
} from './spacedRepetitionService.js';