import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import Verb from '../models/Verb.js';
import User from '../models/User.js';
import TestResult from '../models/TestResult.js';

const router = express.Router();

// Get all users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user progress
router.get('/users/:id/progress', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add verb
router.post('/verbs', protect, admin, async (req, res) => {
  try {
    const verb = await Verb.create(req.body);
    res.status(201).json(verb);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update verb
router.put('/verbs/:id', protect, admin, async (req, res) => {
  try {
    const verb = await Verb.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!verb) {
      return res.status(404).json({ message: 'Verb not found' });
    }
    res.json(verb);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete verb
router.delete('/verbs/:id', protect, admin, async (req, res) => {
  try {
    const verb = await Verb.findByIdAndDelete(req.params.id);
    if (!verb) {
      return res.status(404).json({ message: 'Verb not found' });
    }
    res.json({ message: 'Verb deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get statistics
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVerbs = await Verb.countDocuments();
    const totalTests = await TestResult.countDocuments();
    const avgScore = await TestResult.aggregate([
      { $group: { _id: null, avg: { $avg: '$score' } } }
    ]);

    res.json({
      totalUsers,
      totalVerbs,
      totalTests,
      averageTestScore: avgScore[0]?.avg || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;