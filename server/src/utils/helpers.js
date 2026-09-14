// ==================== Date Helpers ====================

// @desc    Get today's date at midnight (start of day)
export const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// @desc    Get tomorrow's date at midnight
export const getTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

// @desc    Get date N days from now
export const getDateFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// @desc    Get days between two dates
export const getDaysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
};

// @desc    Check if two dates are the same day
export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// @desc    Format date to readable string
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// @desc    Format datetime to readable string
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ==================== Array Helpers ====================

// @desc    Shuffle array (Fisher-Yates)
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// @desc    Get random items from array
export const getRandomItems = (array, count) => {
  if (!array || array.length === 0) return [];
  return shuffleArray(array).slice(0, Math.min(count, array.length));
};

// @desc    Get random single item from array
export const getRandomItem = (array) => {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
};

// @desc    Chunk array into smaller arrays
export const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// @desc    Unique array by key
export const uniqueBy = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

// ==================== String Helpers ====================

// @desc    Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// @desc    Capitalize each word
export const titleCase = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

// @desc    Truncate string
export const truncate = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

// @desc    Slugify string
export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// @desc    Generate random string
export const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// @desc    Generate random ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// ==================== Validation Helpers ====================

// @desc    Validate email
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// @desc    Validate password strength
export const isStrongPassword = (password) => {
  if (!password || password.length < 6) return false;
  return /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
};

// @desc    Validate MongoDB ObjectId
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// @desc    Validate day number (1-30)
export const isValidDay = (day) => {
  const dayNum = parseInt(day);
  return !isNaN(dayNum) && dayNum >= 1 && dayNum <= 30;
};

// @desc    Validate test day (7, 14, 21, 28)
export const isValidTestDay = (day) => {
  return [7, 14, 21, 28].includes(parseInt(day));
};

// ==================== Number Helpers ====================

// @desc    Calculate percentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// @desc    Clamp number between min and max
export const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
};

// @desc    Round to decimal places
export const roundTo = (num, decimals = 2) => {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

// @desc    Random integer between min and max
export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ==================== Object Helpers ====================

// @desc    Pick specific keys from object
export const pick = (obj, keys) => {
  return keys.reduce((acc, key) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

// @desc    Omit specific keys from object
export const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

// @desc    Check if object is empty
export const isEmptyObject = (obj) => {
  return !obj || Object.keys(obj).length === 0;
};

// @desc    Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// @desc    Merge objects deeply
export const deepMerge = (target, source) => {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
};

// ==================== Response Helpers ====================

// @desc    Success response
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// @desc    Error response
export const errorResponse = (res, message = 'Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

// @desc    Paginated response
export const paginatedResponse = (res, data, page, limit, total) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
};

// ==================== Async Helpers ====================

// @desc    Async handler wrapper (eliminates try/catch)
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// @desc    Sleep/delay
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// @desc    Retry async function
export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
};

// ==================== XP & Level Helpers ====================

// @desc    Calculate level from XP
export const calculateLevel = (xp) => {
  return Math.floor(xp / 200) + 1;
};

// @desc    Get XP for next level
export const getXPForNextLevel = (level) => {
  return level * 200;
};

// @desc    Get XP progress to next level
export const getXPProgress = (xp) => {
  const level = calculateLevel(xp);
  const currentLevelXP = (level - 1) * 200;
  const nextLevelXP = level * 200;
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  return {
    level,
    currentLevelXP,
    nextLevelXP,
    xpInLevel: xp - currentLevelXP,
    xpForNext: nextLevelXP - xp,
    progress: Math.round(progress)
  };
};

// @desc    Get mastery level from score
export const getMasteryLevel = (score) => {
  if (score >= 90) return { level: 'Mastered', color: 'green', emoji: '⭐' };
  if (score >= 70) return { level: 'Good', color: 'blue', emoji: '✅' };
  if (score >= 40) return { level: 'Learning', color: 'yellow', emoji: '📖' };
  return { level: 'Weak', color: 'red', emoji: '🔴' };
};

// @desc    Get status from mastery score
export const getStatusFromMastery = (score) => {
  if (score >= 90) return 'mastered';
  if (score >= 70) return 'learned';
  if (score >= 40) return 'learning';
  if (score > 0) return 'revising';
  return 'learning';
};

// ==================== Course Helpers ====================

// @desc    Check if day is a test day
export const isTestDay = (day) => {
  return day > 0 && day % 7 === 0;
};

// @desc    Get test verb count for a day
export const getTestVerbCount = (day) => {
  if (day === 7) return 30;
  if (day === 14) return 60;
  if (day === 21) return 90;
  if (day === 28) return 120;
  return 0;
};

// @desc    Get day type
export const getDayType = (day) => {
  if (day === 28) return 'complete-test';
  if (day === 29) return 'revision';
  if (day === 30) return 'final';
  if (day % 7 === 0) return 'test';
  return 'learning';
};

// @desc    Get day label for display
export const getDayLabel = (day) => {
  const type = getDayType(day);
  const labels = {
    'learning': `Day ${day} — Learning`,
    'test': `Day ${day} — Weekly Test`,
    'complete-test': `Day ${day} — Complete Test`,
    'revision': `Day ${day} — Weak Verbs Revision`,
    'final': `Day ${day} — Final Challenge`
  };
  return labels[type] || `Day ${day}`;
};

// ==================== Logging Helpers ====================

// @desc    Log with timestamp
export const logWithTime = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data || '');
};

// @desc    Log error with details
export const logError = (context, error) => {
  console.error(`❌ [${context}]`, {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

// @desc    Log success
export const logSuccess = (message, data = null) => {
  console.log(`✅ ${message}`, data || '');
};

// ==================== Environment Helpers ====================

// @desc    Check if production
export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

// @desc    Check if development
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

// @desc    Get environment variable with default
export const getEnv = (key, defaultValue = null) => {
  return process.env[key] || defaultValue;
};