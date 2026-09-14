import express from 'express';
import {
  getAllAchievements,
  getEarnedAchievements,
  getLockedAchievements,
  getAchievementById,
  claimAchievement,
  getAchievementProgress,
  getRecentAchievements,
  getNextAchievement
} from '../controllers/achievementController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ==================== Achievement Routes ====================
// All routes are protected (require authentication)

// @route   GET /api/achievements
// @desc    Get all achievements (earned + locked) with status
// @access  Private
router.get('/', protect, getAllAchievements);

// @route   GET /api/achievements/earned
// @desc    Get only earned achievements
// @access  Private
router.get('/earned', protect, getEarnedAchievements);

// @route   GET /api/achievements/locked
// @desc    Get locked (not yet earned) achievements
// @access  Private
router.get('/locked', protect, getLockedAchievements);

// @route   GET /api/achievements/progress
// @desc    Get progress toward each achievement
// @access  Private
router.get('/progress', protect, getAchievementProgress);

// @route   GET /api/achievements/recent
// @desc    Get recently earned achievements
// @access  Private
router.get('/recent', protect, getRecentAchievements);

// @route   GET /api/achievements/next
// @desc    Get next achievable badge
// @access  Private
router.get('/next', protect, getNextAchievement);

// @route   GET /api/achievements/:id
// @desc    Get a specific achievement by badge ID
// @access  Private
// NOTE: This must be LAST because it's a dynamic route
router.get('/:id', protect, getAchievementById);

// @route   POST /api/achievements/claim/:badgeId
// @desc    Claim an unlocked achievement
// @access  Private
router.post('/claim/:badgeId', protect, claimAchievement);

export default router;