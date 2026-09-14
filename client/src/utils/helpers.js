import { COURSE_CONFIG, SPACED_REPETITION, XP_LEVELS } from './constants';

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Format time to readable string
 */
export const formatTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format datetime to readable string
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return `${formatDate(date)} at ${formatTime(date)}`;
};

/**
 * Calculate days between two dates
 */
export const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  const d = new Date(date);
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
};

/**
 * Check if date is in the past
 */
export const isPast = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

/**
 * Check if date is in the future
 */
export const isFuture = (date) => {
  if (!date) return false;
  return new Date(date) > new Date();
};

/**
 * Get day difference from today
 */
export const daysFromToday = (date) => {
  if (!date) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.floor((d - today) / (1000 * 60 * 60 * 24));
};

/**
 * Get mastery level based on score
 */
export const getMasteryLevel = (score) => {
  const { MASTERY } = COURSE_CONFIG;
  if (score >= MASTERY.MASTERED.min) return MASTERY.MASTERED;
  if (score >= MASTERY.GOOD.min) return MASTERY.GOOD;
  if (score >= MASTERY.LEARNING.min) return MASTERY.LEARNING;
  return MASTERY.WEAK;
};

/**
 * Get mastery color based on score
 */
export const getMasteryColor = (score) => {
  const level = getMasteryLevel(score);
  return level.color;
};

/**
 * Get mastery label based on score
 */
export const getMasteryLabel = (score) => {
  const level = getMasteryLevel(score);
  return level.label;
};

/**
 * Calculate XP for next level
 */
export const getNextLevelXP = (currentXP) => {
  const levels = XP_LEVELS;
  for (let i = 0; i < levels.length - 1; i++) {
    if (currentXP >= levels[i].xpRequired && currentXP < levels[i + 1].xpRequired) {
      return levels[i + 1].xpRequired - currentXP;
    }
  }
  return 0;
};

/**
 * Get level from XP
 */
export const getLevelFromXP = (xp) => {
  const levels = XP_LEVELS;
  let level = levels[0].level;
  for (const l of levels) {
    if (xp >= l.xpRequired) {
      level = l.level;
    }
  }
  return level;
};

/**
 * Get level name
 */
export const getLevelName = (level) => {
  const { LEVELS } = COURSE_CONFIG;
  return LEVELS[level] || 'Master';
};

/**
 * Calculate XP progress percentage
 */
export const getXpProgress = (xp) => {
  const currentLevel = getLevelFromXP(xp);
  const currentLevelXP = XP_LEVELS[currentLevel - 1]?.xpRequired || 0;
  const nextLevelXP = XP_LEVELS[currentLevel]?.xpRequired || currentLevelXP + 200;
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

/**
 * Shuffle array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Get random items from array
 */
export const getRandomItems = (array, count) => {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
};

/**
 * Capitalize first letter of string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncate string
 */
export const truncate = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
};

/**
 * Get URL parameters
 */
export const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

/**
 * Build URL with parameters
 */
export const buildUrl = (base, params) => {
  const url = new URL(base, window.location.origin);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

/**
 * Get verb forms display
 */
export const getVerbForms = (verb) => {
  return {
    v1: verb.v1 || '',
    v2: verb.v2 || '',
    v3: verb.v3 || '',
    meaning: verb.meaning || '',
    full: `${verb.v1} - ${verb.v2} - ${verb.v3} (${verb.meaning})`
  };
};

/**
 * Check if verb is irregular
 */
export const isIrregularVerb = (verb) => {
  // Simple check: if V2 doesn't end with 'ed'
  if (!verb.v2) return false;
  return !verb.v2.endsWith('ed') && !verb.v2.endsWith('d');
};

/**
 * Get test result message
 */
export const getTestResultMessage = (score) => {
  const { TEST_RESULT_MESSAGES } = require('./constants');
  if (score >= 90) return TEST_RESULT_MESSAGES.EXCELLENT;
  if (score >= 80) return TEST_RESULT_MESSAGES.VERY_GOOD;
  if (score >= 70) return TEST_RESULT_MESSAGES.PASSED;
  return TEST_RESULT_MESSAGES.NEEDS_REVISION;
};

/**
 * Check if day is test day
 */
export const isTestDay = (day) => {
  return day > 0 && day % 7 === 0;
};

/**
 * Get test verb count for a day
 */
export const getTestVerbCount = (day) => {
  if (day === 7) return 30;
  if (day === 14) return 60;
  if (day === 21) return 90;
  if (day === 28) return 120;
  return 0;
};

/**
 * Get next review date based on spaced repetition
 */
export const getNextReviewDate = (lastReviewed, isCorrect) => {
  const days = isCorrect ? SPACED_REPETITION.CORRECT_REVIEW : SPACED_REPETITION.INCORRECT_REVIEW;
  const date = new Date(lastReviewed);
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Format duration (seconds to MM:SS)
 */
export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Get random motivational message
 */
export const getRandomMotivation = () => {
  const { MOTIVATION_MESSAGES } = require('./constants');
  return MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)];
};

/**
 * Calculate course progress percentage
 */
export const getCourseProgress = (currentDay, totalDays = 30) => {
  return Math.round((currentDay / totalDays) * 100);
};

/**
 * Get badge icon based on badge name
 */
export const getBadgeIcon = (badgeName) => {
  const { BADGES } = require('./constants');
  const badge = Object.values(BADGES).find(b => b.id === badgeName);
  return badge?.icon || '🏅';
};

/**
 * Get badge name based on badge id
 */
export const getBadgeName = (badgeId) => {
  const { BADGES } = require('./constants');
  const badge = Object.values(BADGES).find(b => b.id === badgeId);
  return badge?.name || badgeId;
};

/**
 * Check if user has achieved a badge
 */
export const hasAchievement = (achievements, badgeId) => {
  return achievements.some(a => a.badge === badgeId);
};

/**
 * Convert object to FormData
 */
export const objectToFormData = (obj) => {
  const formData = new FormData();
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined && obj[key] !== null) {
      formData.append(key, obj[key]);
    }
  });
  return formData;
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Get base URL
 */
export const getBaseUrl = () => {
  return import.meta.env.VITE_API_URL || '';
};

/**
 * Check if running in production
 */
export const isProduction = () => {
  return import.meta.env.PROD;
};

/**
 * Get environment variable
 */
export const getEnv = (key, defaultValue = '') => {
  return import.meta.env[key] || defaultValue;
};

/**
 * Sleep for specified milliseconds
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 */
export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
};

/**
 * Validates email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 */
export const isStrongPassword = (password) => {
  // At least 6 characters, at least one letter and one number
  return password.length >= 6 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Get color based on string (for avatars)
 */
export const getAvatarColor = (name) => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};