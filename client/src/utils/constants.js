// Course configuration
export const COURSE_CONFIG = {
  TOTAL_DAYS: 30,
  TOTAL_VERBS: 120,
  VERBS_PER_DAY: 5,
  TEST_INTERVAL: 7, // Every 7th day is a test
  PASSING_SCORE: 70,
  XP: {
    LEARN_VERB: 10, // Per verb learned
    DAILY_TASK: 20,
    DAILY_TEST: 50,
    WEEKLY_TEST: 100,
    PERFECT_SCORE_BONUS: 50,
    STREAK_BONUS: 10,
    COMPLETE_DAY: 20
  },
  LEVELS: {
    1: 'Beginner',
    2: 'Learner',
    3: 'Explorer',
    4: 'Builder',
    5: 'Speaker',
    6: 'Verb Master'
  },
  MASTERY: {
    WEAK: { min: 0, max: 39, label: 'Weak', color: 'red' },
    LEARNING: { min: 40, max: 69, label: 'Learning', color: 'yellow' },
    GOOD: { min: 70, max: 89, label: 'Good', color: 'blue' },
    MASTERED: { min: 90, max: 100, label: 'Mastered', color: 'green' }
  }
};

// Achievement badges configuration
export const BADGES = {
  '7_DAY_STREAK': {
    id: '7_day_streak',
    icon: '🔥',
    name: '7 Day Streak',
    description: 'Maintain a 7-day learning streak',
    requirement: 'Complete activities for 7 consecutive days'
  },
  '30_VERBS_LEARNED': {
    id: '30_verbs_learned',
    icon: '📚',
    name: '30 Verbs Learned',
    description: 'Learn 30 verbs to mastery',
    requirement: 'Master 30 verbs'
  },
  'FIRST_WEEKLY_TEST': {
    id: 'first_weekly_test',
    icon: '🏆',
    name: 'First Weekly Test',
    description: 'Complete your first weekly test',
    requirement: 'Complete Day 7 test'
  },
  'PERFECT_SCORE': {
    id: 'perfect_score',
    icon: '💯',
    name: 'Perfect Score',
    description: 'Get 100% on any test',
    requirement: 'Score 100% on a test'
  },
  '60_VERBS': {
    id: '60_verbs',
    icon: '🚀',
    name: '60 Verbs',
    description: 'Learn 60 verbs to mastery',
    requirement: 'Master 60 verbs'
  },
  '120_VERBS': {
    id: '120_verbs',
    icon: '👑',
    name: '120 Verbs',
    description: 'Learn all 120 verbs',
    requirement: 'Master all 120 verbs'
  },
  '30_DAY_CHALLENGE': {
    id: '30_day_challenge',
    icon: '🎯',
    name: '30 Day Challenge',
    description: 'Complete the full 30-day course',
    requirement: 'Complete all 30 days'
  }
};

// Question types for tests and practice
export const QUESTION_TYPES = {
  V2_FROM_V1: 'V2_FROM_V1',
  V3_FROM_V1: 'V3_FROM_V1',
  V1_FROM_V2: 'V1_FROM_V2',
  MEANING: 'MEANING',
  TRANSLATION: 'TRANSLATION',
  FILL_BLANK: 'FILL_BLANK',
  SENTENCE_CORRECTION: 'SENTENCE_CORRECTION'
};

// Verb status types
export const VERB_STATUS = {
  LOCKED: 'locked',
  LEARNING: 'learning',
  REVISING: 'revising',
  LEARNED: 'learned',
  MASTERED: 'mastered'
};

// Test types
export const TEST_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  COMPLETE: 'complete',
  FINAL: 'final'
};

// XP thresholds for levels
export const XP_LEVELS = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 200 },
  { level: 3, xpRequired: 400 },
  { level: 4, xpRequired: 600 },
  { level: 5, xpRequired: 800 },
  { level: 6, xpRequired: 1000 }
];

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me'
  },
  COURSE: {
    CURRENT: '/api/course/current',
    DAY: (day) => `/api/course/day/${day}`,
    COMPLETE: '/api/course/day/complete',
    TIMELINE: '/api/course/timeline'
  },
  VERBS: {
    ALL: '/api/verbs',
    BY_DAY: (day) => `/api/verbs/day/${day}`,
    BY_ID: (id) => `/api/verbs/${id}`
  },
  PRACTICE: {
    DAILY: '/api/practice/daily',
    SUBMIT: '/api/practice/submit'
  },
  TESTS: {
    WEEKLY: (day) => `/api/tests/weekly/${day}`,
    SUBMIT: '/api/tests/submit',
    HISTORY: '/api/tests/history'
  },
  PROGRESS: {
    STATS: '/api/progress/stats',
    WEAK_VERBS: '/api/progress/weak-verbs',
    VERBS: '/api/progress/verbs',
    ACHIEVEMENTS: '/api/progress/achievements',
    DAILY: '/api/progress/daily'
  }
};

// Local storage keys
export const STORAGE_KEYS = {
  USER: 'verb_challenge_user',
  THEME: 'verb_challenge_theme',
  LANGUAGE: 'verb_challenge_language',
  LAST_ACTIVITY: 'verb_challenge_last_activity'
};

// Time constants (in milliseconds)
export const TIME = {
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  HOUR: 60 * 60 * 1000,
  MINUTE: 60 * 1000,
  SECOND: 1000
};

// Spaced repetition intervals (in days)
export const SPACED_REPETITION = {
  FIRST_REVIEW: 1,
  SECOND_REVIEW: 2,
  THIRD_REVIEW: 4,
  FOURTH_REVIEW: 7,
  FIFTH_REVIEW: 14,
  SIXTH_REVIEW: 30,
  CORRECT_REVIEW: 3,
  INCORRECT_REVIEW: 1
};

// Daily task types
export const TASK_TYPES = {
  RECALL_FORMS: 'recall_forms',
  MEANING_TEST: 'meaning_test',
  TRANSLATION: 'translation',
  FILL_BLANK: 'fill_blank',
  SENTENCE_BUILDER: 'sentence_builder'
};

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  LESSON: '/lesson',
  LESSON_DAY: (day) => `/lesson/${day}`,
  TEST: (day) => `/test/${day}`,
  PROGRESS: '/progress',
  VERBS: '/verbs',
  ACHIEVEMENTS: '/achievements',
  PROFILE: '/profile'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  SERVER: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please login to continue.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION: 'Please check your input and try again.',
  RATE_LIMIT: 'Too many requests. Please wait a moment.',
  DEFAULT: 'Something went wrong. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back! 🎉',
  REGISTER: 'Account created successfully! 🎉',
  LOGOUT: 'Logged out successfully',
  DAY_COMPLETE: '🎉 Day completed!',
  TEST_SUBMITTED: 'Test submitted successfully!',
  PRACTICE_SUBMITTED: 'Practice completed!',
  PROFILE_UPDATED: 'Profile updated successfully!'
};

// Motivation messages
export const MOTIVATION_MESSAGES = [
  '🔥 Bas 2 verbs aur!',
  'Excellent! Aaj ka lesson complete karo.',
  'Kal test day hai — ready ho?',
  'Tumne 60 verbs complete kar liye!',
  'Halfway there! 🚀',
  'Aaj revision hai. Apne weak verbs ko strong banao.',
  "Don't worry about mistakes. Mistakes are part of learning.",
  'You are building a habit! Keep going! 💪',
  'Every verb you learn brings you closer to fluency!',
  'Today is a great day to learn something new!'
];

// Day types
export const DAY_TYPES = {
  LEARNING: 'learning',
  TEST: 'test',
  REVISION: 'revision',
  FINAL: 'final'
};

// Test result messages
export const TEST_RESULT_MESSAGES = {
  EXCELLENT: '🏆 Excellent! Outstanding performance!',
  VERY_GOOD: '🔥 Very Good! Keep it up!',
  PASSED: '👍 Passed! Good effort!',
  NEEDS_REVISION: '📚 Needs Revision. Review weak verbs!'
};

// UI Constants
export const UI = {
  MAX_WEAK_VERBS_DISPLAY: 6,
  MAX_ACHIEVEMENTS_DISPLAY: 4,
  DEFAULT_PAGE_SIZE: 20,
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300
};