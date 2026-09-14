import express from 'express';
import {
  getWeeklyTest,
  submitTest,
  getTestHistory
} from '../controllers/testController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/weekly/:day', protect, getWeeklyTest);
router.post('/submit', protect, submitTest);
router.get('/history', protect, getTestHistory);

export default router;