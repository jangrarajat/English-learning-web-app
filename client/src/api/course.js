import api from './api';

// ==================== Course APIs ====================

/**
 * Get current day status and info
 */
export const getCurrentDay = () => api.get('/course/current');

/**
 * Get verbs for a specific day
 * @param {number} day
 */
export const getDayVerbs = (day) => api.get(`/course/day/${day}`);

/**
 * Complete a day with score and tasks
 * @param {Object} data - { day, score, tasksCompleted }
 */
export const completeDay = (data) => api.post('/course/day/complete', data);

/**
 * Get course timeline (30-day overview)
 */
export const getCourseTimeline = () => api.get('/course/timeline');

/**
 * Get day progress details
 * @param {number} day
 */
export const getDayProgress = (day) => api.get(`/course/progress/${day}`);

/**
 * Reset a specific day (for testing/admin)
 * @param {number} day
 */
export const resetDay = (day) => api.post(`/course/reset/${day}`);

/**
 * Get next unlocked day info
 */
export const getNextDay = () => api.get('/course/next-day');

/**
 * Check if a specific day is unlocked
 * @param {number} day
 */
export const checkDayUnlock = (day) => api.get(`/course/check/${day}`);

/**
 * Get daily tasks for a specific day
 * @param {number} day
 */
export const getDailyTasks = (day) => api.get(`/course/tasks/${day}`);

/**
 * Submit daily task answers
 * @param {Object} data - { day, taskId, answers }
 */
export const submitDailyTask = (data) => api.post('/course/tasks/submit', data);

/**
 * Mark a task as complete
 * @param {Object} data - { day, taskId }
 */
export const markTaskComplete = (data) => api.post('/course/tasks/complete', data);