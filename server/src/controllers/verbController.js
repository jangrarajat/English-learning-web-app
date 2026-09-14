import Verb from '../models/Verb.js';
import UserVerbProgress from '../models/UserVerbProgress.js';
import User from '../models/User.js';
import { canAccessDay } from '../services/courseService.js';

// ==================== @desc    Get all verbs (with user progress) ====================
// @route   GET /api/verbs
// @access  Private
export const getAllVerbs = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const maxDay = user.currentCourseDay + 1;

    // Get all verbs sorted by day
    const verbs = await Verb.find().sort({ day: 1, _id: 1 });

    // Get user progress
    const verbIds = verbs.map(v => v._id);
    const progress = await UserVerbProgress.find({
      userId,
      verbId: { $in: verbIds }
    });

    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.verbId.toString()] = p;
    });

    const verbsWithProgress = verbs.map(verb => {
      const isLocked = verb.day > maxDay;
      return {
        ...verb.toObject(),
        progress: progressMap[verb._id.toString()] || null,
        isLocked
      };
    });

    res.json(verbsWithProgress);
  } catch (error) {
    console.error('getAllVerbs error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get verbs by day ====================
// @route   GET /api/verbs/day/:day
// @access  Private
export const getVerbsByDay = async (req, res) => {
  try {
    const { day } = req.params;
    const userId = req.user._id;
    const dayNum = parseInt(day);

    if (isNaN(dayNum) || dayNum < 1 || dayNum > 30) {
      return res.status(400).json({ message: 'Invalid day number' });
    }

    const verbs = await Verb.find({ day: dayNum });

    if (!verbs.length) {
      return res.status(404).json({ message: 'No verbs found for this day' });
    }

    const verbIds = verbs.map(v => v._id);
    const progress = await UserVerbProgress.find({
      userId,
      verbId: { $in: verbIds }
    });

    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.verbId.toString()] = p;
    });

    const verbsWithProgress = verbs.map(verb => ({
      ...verb.toObject(),
      progress: progressMap[verb._id.toString()] || null
    }));

    res.json(verbsWithProgress);
  } catch (error) {
    console.error('getVerbsByDay error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get verb by ID ====================
// @route   GET /api/verbs/:id
// @access  Private
export const getVerbById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const verb = await Verb.findById(id);
    if (!verb) {
      return res.status(404).json({ message: 'Verb not found' });
    }

    const progress = await UserVerbProgress.findOne({
      userId,
      verbId: verb._id
    });

    res.json({
      ...verb.toObject(),
      progress: progress || null
    });
  } catch (error) {
    console.error('getVerbById error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get today's verbs ====================
// @route   GET /api/verbs/today
// @access  Private
export const getTodayVerbs = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentDay = user.currentCourseDay + 1;
    const verbs = await Verb.find({ day: currentDay });

    const verbIds = verbs.map(v => v._id);
    const progress = await UserVerbProgress.find({
      userId,
      verbId: { $in: verbIds }
    });

    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.verbId.toString()] = p;
    });

    const verbsWithProgress = verbs.map(verb => ({
      ...verb.toObject(),
      progress: progressMap[verb._id.toString()] || null
    }));

    res.json({
      day: currentDay,
      verbs: verbsWithProgress
    });
  } catch (error) {
    console.error('getTodayVerbs error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Search verbs ====================
// @route   GET /api/verbs/search?q=query
// @access  Private
export const searchVerbs = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user._id;

    if (!q || q.trim().length < 1) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const searchRegex = new RegExp(q.trim(), 'i');

    const verbs = await Verb.find({
      $or: [
        { v1: searchRegex },
        { v2: searchRegex },
        { v3: searchRegex },
        { meaning: searchRegex }
      ]
    }).limit(50);

    const verbIds = verbs.map(v => v._id);
    const progress = await UserVerbProgress.find({
      userId,
      verbId: { $in: verbIds }
    });

    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.verbId.toString()] = p;
    });

    const results = verbs.map(verb => ({
      ...verb.toObject(),
      progress: progressMap[verb._id.toString()] || null
    }));

    res.json(results);
  } catch (error) {
    console.error('searchVerbs error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get verbs by status ====================
// @route   GET /api/verbs/status/:status
// @access  Private
export const getVerbsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const userId = req.user._id;

    const validStatuses = ['learning', 'learned', 'mastered', 'revising'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const progress = await UserVerbProgress.find({
      userId,
      status
    }).populate('verbId');

    const verbs = progress.map(p => ({
      ...p.verbId.toObject(),
      progress: p
    }));

    res.json(verbs);
  } catch (error) {
    console.error('getVerbsByStatus error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get weak verbs ====================
// @route   GET /api/verbs/weak
// @access  Private
export const getWeakVerbsList = async (req, res) => {
  try {
    const userId = req.user._id;

    const weakProgress = await UserVerbProgress.find({
      userId,
      masteryScore: { $lt: 40 }
    })
      .populate('verbId')
      .sort({ masteryScore: 1 })
      .limit(30);

    const weakVerbs = weakProgress
      .filter(p => p.verbId)
      .map(p => ({
        ...p.verbId.toObject(),
        progress: {
          masteryScore: p.masteryScore,
          correctAnswers: p.correctAnswers,
          wrongAnswers: p.wrongAnswers,
          status: p.status,
          lastReviewedAt: p.lastReviewedAt,
          nextReviewAt: p.nextReviewAt
        }
      }));

    res.json(weakVerbs);
  } catch (error) {
    console.error('getWeakVerbsList error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get verbs due for review ====================
// @route   GET /api/verbs/due-review
// @access  Private
export const getVerbsDueForReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const dueProgress = await UserVerbProgress.find({
      userId,
      nextReviewAt: { $lte: now }
    })
      .populate('verbId')
      .sort({ nextReviewAt: 1 })
      .limit(20);

    const dueVerbs = dueProgress
      .filter(p => p.verbId)
      .map(p => ({
        ...p.verbId.toObject(),
        progress: {
          masteryScore: p.masteryScore,
          status: p.status,
          nextReviewAt: p.nextReviewAt,
          lastReviewedAt: p.lastReviewedAt
        }
      }));

    res.json(dueVerbs);
  } catch (error) {
    console.error('getVerbsDueForReview error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get verb statistics ====================
// @route   GET /api/verbs/stats
// @access  Private
export const getVerbStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalVerbs = await Verb.countDocuments();
    const learningCount = await UserVerbProgress.countDocuments({ userId, status: 'learning' });
    const learnedCount = await UserVerbProgress.countDocuments({ userId, status: 'learned' });
    const masteredCount = await UserVerbProgress.countDocuments({ userId, status: 'mastered' });
    const weakCount = await UserVerbProgress.countDocuments({ userId, masteryScore: { $lt: 40 } });

    res.json({
      total: totalVerbs,
      learning: learningCount,
      learned: learnedCount,
      mastered: masteredCount,
      weak: weakCount,
      notStarted: totalVerbs - (learningCount + learnedCount + masteredCount)
    });
  } catch (error) {
    console.error('getVerbStats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get verbs by day range ====================
// @route   GET /api/verbs/range?startDay=1&endDay=7
// @access  Private
export const getVerbsByRange = async (req, res) => {
  try {
    const { startDay, endDay } = req.query;
    const userId = req.user._id;

    const start = parseInt(startDay) || 1;
    const end = parseInt(endDay) || 30;

    const verbs = await Verb.find({
      day: { $gte: start, $lte: end }
    }).sort({ day: 1 });

    const verbIds = verbs.map(v => v._id);
    const progress = await UserVerbProgress.find({
      userId,
      verbId: { $in: verbIds }
    });

    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.verbId.toString()] = p;
    });

    const verbsWithProgress = verbs.map(verb => ({
      ...verb.toObject(),
      progress: progressMap[verb._id.toString()] || null
    }));

    res.json(verbsWithProgress);
  } catch (error) {
    console.error('getVerbsByRange error:', error);
    res.status(500).json({ message: error.message });
  }
};