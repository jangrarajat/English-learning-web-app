import express from 'express';
import {
  getVerbsByDay,
  getAllVerbs,
  getVerbById
} from '../controllers/verbController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAllVerbs);
router.get('/day/:day', protect, getVerbsByDay);
router.get('/:id', protect, getVerbById);

export default router;