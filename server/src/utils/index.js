// ==================== Central Utils Exports ====================

// Seed data
export { verbs, getVerbsByDay, getTotalVerbCount, getUniqueDays } from './seedData.js';

// Date helpers
export {
  getToday,
  getTomorrow,
  getDateFromNow,
  getDaysBetween,
  isSameDay,
  formatDate,
  formatDateTime
} from './helpers.js';

// Array helpers
export {
  shuffleArray,
  getRandomItems,
  getRandomItem,
  chunkArray,
  uniqueBy
} from './helpers.js';

// String helpers
export {
  capitalize,
  titleCase,
  truncate,
  slugify,
  generateRandomString,
  generateId
} from './helpers.js';

// Validation helpers
export {
  isValidEmail,
  isStrongPassword,
  isValidObjectId,
  isValidDay,
  isValidTestDay
} from './helpers.js';

// Number helpers
export {
  calculatePercentage,
  clamp,
  roundTo,
  randomInt
} from './helpers.js';

// Object helpers
export {
  pick,
  omit,
  isEmptyObject,
  deepClone,
  deepMerge
} from './helpers.js';

// Response helpers
export {
  successResponse,
  errorResponse,
  paginatedResponse
} from './helpers.js';

// Async helpers
export {
  asyncHandler,
  sleep,
  retry
} from './helpers.js';

// XP & Level helpers
export {
  calculateLevel,
  getXPForNextLevel,
  getXPProgress,
  getMasteryLevel,
  getStatusFromMastery
} from './helpers.js';

// Course helpers
export {
  isTestDay,
  getTestVerbCount,
  getDayType,
  getDayLabel
} from './helpers.js';

// Logging helpers
export {
  logWithTime,
  logError,
  logSuccess
} from './helpers.js';

// Environment helpers
export {
  isProduction,
  isDevelopment,
  getEnv
} from './helpers.js';