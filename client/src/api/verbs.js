import api from './api';

// ==================== Verb APIs ====================

/**
 * Get all verbs (with user progress)
 */
export const getAllVerbs = () => api.get('/verbs');

/**
 * Get verbs for a specific day
 * @param {number} day
 */
export const getVerbsByDay = (day) => api.get(`/verbs/day/${day}`);

/**
 * Get a specific verb by ID
 * @param {string} id
 */
export const getVerbById = (id) => api.get(`/verbs/${id}`);

/**
 * Get today's verbs (based on current course day)
 */
export const getTodayVerbs = () => api.get('/verbs/today');

/**
 * Search verbs by keyword
 * @param {string} query
 */
export const searchVerbs = (query) => api.get('/verbs/search', { params: { q: query } });

/**
 * Get verbs by status (learning, learned, mastered, locked)
 * @param {string} status
 */
export const getVerbsByStatus = (status) => api.get(`/verbs/status/${status}`);

/**
 * Get weak verbs (mastery < 40)
 */
export const getWeakVerbsList = () => api.get('/verbs/weak');

/**
 * Get verbs due for review (spaced repetition)
 */
export const getVerbsDueForReview = () => api.get('/verbs/due-review');

/**
 * Get verb statistics
 */
export const getVerbStats = () => api.get('/verbs/stats');

/**
 * Get verbs by day range
 * @param {Object} params - { startDay, endDay }
 */
export const getVerbsByRange = (params) => api.get('/verbs/range', { params });