import api from './api';

// ==================== Practice APIs ====================

/**
 * Get daily practice questions
 */
export const getDailyPractice = () => api.get('/practice/daily');

/**
 * Submit practice answers
 * @param {Object} data - { answers, questions }
 */
export const submitPractice = (data) => api.post('/practice/submit', data);

/**
 * Get practice questions by verb
 * @param {string} verbId
 */
export const getPracticeByVerb = (verbId) => api.get(`/practice/verb/${verbId}`);

/**
 * Get practice questions by category
 * @param {string} category - v1, v2, v3, meaning, translation
 */
export const getPracticeByCategory = (category) => api.get(`/practice/category/${category}`);

/**
 * Get quick practice (5 questions)
 */
export const getQuickPractice = () => api.get('/practice/quick');

/**
 * Get practice history
 */
export const getPracticeHistory = () => api.get('/practice/history');

/**
 * Get practice statistics
 */
export const getPracticeStats = () => api.get('/practice/stats');

/**
 * Get spaced repetition practice
 */
export const getSpacedRepetition = () => api.get('/practice/spaced-repetition');

/**
 * Submit spaced repetition result
 * @param {Object} data - { verbId, isCorrect }
 */
export const submitSpacedRepetition = (data) => api.post('/practice/spaced-repetition', data);

/**
 * Get weak verb practice
 */
export const getWeakVerbPractice = () => api.get('/practice/weak');

/**
 * Get custom practice with filters
 * @param {Object} params - { days, types, count }
 */
export const getCustomPractice = (params) => api.get('/practice/custom', { params });

/**
 * Get practice recommendations based on performance
 */
export const getPracticeRecommendations = () => api.get('/practice/recommendations');