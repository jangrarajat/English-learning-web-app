import api from './api';

// ==================== Achievement APIs ====================

/**
 * Get all achievements (earned and available)
 */
export const getAllAchievements = () => api.get('/achievements');

/**
 * Get only earned achievements
 */
export const getEarnedAchievements = () => api.get('/achievements/earned');

/**
 * Get locked achievements
 */
export const getLockedAchievements = () => api.get('/achievements/locked');

/**
 * Get achievement by ID
 * @param {string} id
 */
export const getAchievementById = (id) => api.get(`/achievements/${id}`);

/**
 * Claim an unlocked achievement
 * @param {string} badgeId
 */
export const claimAchievement = (badgeId) => api.post(`/achievements/claim/${badgeId}`);

/**
 * Get achievement progress
 */
export const getAchievementProgress = () => api.get('/achievements/progress');

/**
 * Get recently earned achievements
 * @param {number} limit
 */
export const getRecentAchievements = (limit = 5) => api.get('/achievements/recent', { params: { limit } });

/**
 * Get next achievable badge
 */
export const getNextAchievement = () => api.get('/achievements/next');