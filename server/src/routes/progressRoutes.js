import express from 'express';
import {
  getStats,
  getWeakVerbs,
  getVerbProgress,
  getAchievements,
  getDailyProgress
} from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, getStats);
router.get('/weak-verbs', protect, getWeakVerbs);
router.get('/verbs', protect, getVerbProgress);
router.get('/achievements', protect, getAchievements);
router.get('/daily', protect, getDailyProgress);

export default router;