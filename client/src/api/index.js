// ==================== Central API Exports ====================

// Main axios instance
export { default as api, setAuthToken, clearAuth } from './api';

// Auth APIs
export * as authApi from './auth';

// Course APIs
export * as courseApi from './course';

// Verbs APIs
export * as verbsApi from './verbs';

// Progress APIs
export * as progressApi from './progress';

// Tests APIs
export * as testsApi from './tests';

// Practice APIs
export * as practiceApi from './practice';

// Achievements APIs
export * as achievementsApi from './achievements';

// ==================== Re-export commonly used methods ====================

// Auth
export { 
  register, 
  login, 
  logout, 
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} from './auth';

// Course
export { 
  getCurrentDay, 
  getDayVerbs, 
  completeDay, 
  getCourseTimeline,
  getDayProgress,
  getDailyTasks,
  submitDailyTask,
  markTaskComplete
} from './course';

// Verbs
export { 
  getAllVerbs, 
  getVerbsByDay, 
  getVerbById, 
  getTodayVerbs,
  searchVerbs,
  getVerbsByStatus,
  getWeakVerbsList,
  getVerbsDueForReview,
  getVerbStats
} from './verbs';

// Progress
export { 
  getStats, 
  getWeakVerbs, 
  getVerbProgress, 
  getAchievements, 
  getDailyProgress,
  getVerbProgressById,
  getMasteryBreakdown,
  getAnalytics
} from './progress';

// Tests
export { 
  getWeeklyTest, 
  submitTest, 
  getTestHistory,
  getTestResult,
  getTestStats,
  getTestWeakVerbs,
  retryTest,
  getFinalTest,
  submitFinalTest
} from './tests';

// Practice
export { 
  getDailyPractice, 
  submitPractice,
  getPracticeByVerb,
  getQuickPractice,
  getSpacedRepetition,
  submitSpacedRepetition,
  getWeakVerbPractice,
  getCustomPractice
} from './practice';

// Achievements
export { 
  getAllAchievements,
  getEarnedAchievements,
  getLockedAchievements,
  claimAchievement,
  getAchievementProgress,
  getRecentAchievements
} from './achievements';