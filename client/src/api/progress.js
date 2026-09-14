import api from './api';

// ==================== Progress APIs ====================

/**
 * Get overall progress statistics
 */
export const getStats = () => api.get('/progress/stats');

/**
 * Get weak verbs (mastery < 40%)
 */
export const getWeakVerbs = () => api.get('/progress/weak-verbs');

/**
 * Get verb progress grouped by day
 */
export const getVerbProgress = () => api.get('/progress/verbs');

/**
 * Get earned achievements
 */
export const getAchievements = () => api.get('/progress/achievements');

/**
 * Get daily progress (completed days)
 */
export const getDailyProgress = () => api.get('/progress/daily');

/**
 * Get progress for a specific verb
 * @param {string} verbId
 */
export const getVerbProgressById = (verbId) => api.get(`/progress/verb/${verbId}`);

/**
 * Get mastery breakdown by status
 */
export const getMasteryBreakdown = () => api.get('/progress/mastery');

/**
 * Get learning analytics (streak, avg score, time spent)
 */
export const getAnalytics = () => api.get('/progress/analytics');

/**
 * Get progress summary for charts
 * @param {Object} params - { from, to }
 */
export const getProgressChart = (params) => api.get('/progress/chart', { params });

/**
 * Get weak verb recommendations for practice
 */
export const getWeakVerbRecommendations = () => api.get('/progress/recommendations');

/**
 * Update verb mastery manually (admin only)
 * @param {Object} data - { verbId, masteryScore }
 */
export const updateVerbMastery = (data) => api.put('/progress/mastery', data);