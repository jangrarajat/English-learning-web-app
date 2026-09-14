import express from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate, userValidationRules } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, validate(userValidationRules.register), register);
router.post('/login', authLimiter, validate(userValidationRules.login), login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;