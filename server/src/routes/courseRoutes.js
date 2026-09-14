import express from 'express';
import {
  getCurrentDay,
  completeDay,
  getDayVerbs,
  getCourseTimeline
} from '../controllers/courseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/current', protect, getCurrentDay);
router.post('/day/complete', protect, completeDay);
router.get('/day/:day', protect, getDayVerbs);
router.get('/timeline', protect, getCourseTimeline);

export default router;