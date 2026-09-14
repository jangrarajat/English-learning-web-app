import express from 'express';
import {
  getDailyPractice,
  submitPractice
} from '../controllers/practiceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/daily', protect, getDailyPractice);
router.post('/submit', protect, submitPractice);

export default router;