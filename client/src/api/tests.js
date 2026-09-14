import api from './api';

// ==================== Test APIs ====================

/**
 * Get weekly test questions
 * @param {number} day - Test day (7, 14, 21, 28)
 */
export const getWeeklyTest = (day) => api.get(`/tests/weekly/${day}`);

/**
 * Submit test answers
 * @param {Object} data - { day, answers, questions }
 */
export const submitTest = (data) => api.post('/tests/submit', data);

/**
 * Get test history
 */
export const getTestHistory = () => api.get('/tests/history');

/**
 * Get a specific test result
 * @param {string} testId
 */
export const getTestResult = (testId) => api.get(`/tests/result/${testId}`);

/**
 * Get test statistics
 */
export const getTestStats = () => api.get('/tests/stats');

/**
 * Get weak verbs from all tests
 */
export const getTestWeakVerbs = () => api.get('/tests/weak-verbs');

/**
 * Retry a failed test
 * @param {number} day
 */
export const retryTest = (day) => api.get(`/tests/retry/${day}`);

/**
 * Get practice test (not graded)
 * @param {Object} params - { count, difficulty }
 */
export const getPracticeTest = (params) => api.get('/tests/practice', { params });

/**
 * Get test review with explanations
 * @param {string} testId
 */
export const getTestReview = (testId) => api.get(`/tests/review/${testId}`);

/**
 * Get final comprehensive test
 */
export const getFinalTest = () => api.get('/tests/final');

/**
 * Submit final test
 * @param {Object} data - { answers, questions }
 */
export const submitFinalTest = (data) => api.post('/tests/final/submit', data);