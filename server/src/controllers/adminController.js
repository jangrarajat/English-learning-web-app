import User from '../models/User.js';
import Verb from '../models/Verb.js';
import TestResult from '../models/TestResult.js';
import DailyProgress from '../models/DailyProgress.js';
import UserVerbProgress from '../models/UserVerbProgress.js';

// ==================== @desc    Get all users ====================
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;

    const query = search
      ? {
          $or: [
            { name: new RegExp(search, 'i') },
            { email: new RegExp(search, 'i') }
          ]
        }
      : {};

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get single user ====================
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verbProgress = await UserVerbProgress.countDocuments({ userId: user._id });
    const dailyProgress = await DailyProgress.countDocuments({ userId: user._id, completed: true });
    const tests = await TestResult.countDocuments({ userId: user._id });

    res.json({
      ...user.toObject(),
      stats: {
        verbsTracked: verbProgress,
        daysCompleted: dailyProgress,
        testsCompleted: tests
      }
    });
  } catch (error) {
    console.error('getUserById error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Update user ====================
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { name, email, isAdmin, currentCourseDay, streak, xp, level } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    if (currentCourseDay !== undefined) user.currentCourseDay = currentCourseDay;
    if (streak !== undefined) user.streak = streak;
    if (xp !== undefined) user.xp = xp;
    if (level !== undefined) user.level = level;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Delete user ====================
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all associated data
    await Promise.all([
      UserVerbProgress.deleteMany({ userId: user._id }),
      DailyProgress.deleteMany({ userId: user._id }),
      TestResult.deleteMany({ userId: user._id }),
      User.findByIdAndDelete(user._id)
    ]);

    res.json({ message: 'User and all associated data deleted' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Add verb ====================
// @route   POST /api/admin/verbs
// @access  Private/Admin
export const addVerb = async (req, res) => {
  try {
    const { v1, v2, v3, meaning, pronunciation, examples, hindiTranslations, day, difficulty } = req.body;

    if (!v1 || !v2 || !v3 || !meaning || !day) {
      return res.status(400).json({ message: 'Missing required verb fields' });
    }

    const existing = await Verb.findOne({ v1 });
    if (existing) {
      return res.status(400).json({ message: 'Verb already exists' });
    }

    const verb = await Verb.create({
      v1, v2, v3, meaning, pronunciation, examples, hindiTranslations,
      day, difficulty: difficulty || 1
    });

    res.status(201).json(verb);
  } catch (error) {
    console.error('addVerb error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Update verb ====================
// @route   PUT /api/admin/verbs/:id
// @access  Private/Admin
export const updateVerb = async (req, res) => {
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
    console.error('updateVerb error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Delete verb ====================
// @route   DELETE /api/admin/verbs/:id
// @access  Private/Admin
export const deleteVerb = async (req, res) => {
  try {
    const verb = await Verb.findByIdAndDelete(req.params.id);
    if (!verb) {
      return res.status(404).json({ message: 'Verb not found' });
    }
    res.json({ message: 'Verb deleted successfully' });
  } catch (error) {
    console.error('deleteVerb error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get platform statistics ====================
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVerbs = await Verb.countDocuments();
    const totalTests = await TestResult.countDocuments();

    // Active users in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await User.countDocuments({
      lastActivityDate: { $gte: sevenDaysAgo }
    });

    // Average test score
    const avgResult = await TestResult.aggregate([
      { $group: { _id: null, avg: { $avg: '$score' } } }
    ]);
    const averageTestScore = avgResult[0]?.avg || 0;

    // Average streak
    const streakResult = await User.aggregate([
      { $group: { _id: null, avg: { $avg: '$streak' } } }
    ]);
    const averageStreak = streakResult[0]?.avg || 0;

    // Course completion rate
    const completedUsers = await User.countDocuments({ currentCourseDay: { $gte: 30 } });
    const completionRate = totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0;

    res.json({
      totalUsers,
      activeUsers,
      totalVerbs,
      totalTests,
      averageTestScore: Math.round(averageTestScore),
      averageStreak: Math.round(averageStreak * 10) / 10,
      completionRate: Math.round(completionRate),
      completedUsers
    });
  } catch (error) {
    console.error('getPlatformStats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get difficult verbs ====================
// @route   GET /api/admin/difficult-verbs
// @access  Private/Admin
export const getDifficultVerbs = async (req, res) => {
  try {
    const difficult = await UserVerbProgress.aggregate([
      {
        $group: {
          _id: '$verbId',
          totalWrong: { $sum: '$wrongAnswers' },
          totalCorrect: { $sum: '$correctAnswers' },
          avgMastery: { $avg: '$masteryScore' },
          userCount: { $sum: 1 }
        }
      },
      { $match: { totalWrong: { $gt: 0 } } },
      { $sort: { totalWrong: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'verbs',
          localField: '_id',
          foreignField: '_id',
          as: 'verb'
        }
      },
      { $unwind: '$verb' }
    ]);

    const result = difficult.map(d => ({
      verb: d.verb.v1,
      v2: d.verb.v2,
      v3: d.verb.v3,
      meaning: d.verb.meaning,
      day: d.verb.day,
      totalWrong: d.totalWrong,
      totalCorrect: d.totalCorrect,
      avgMastery: Math.round(d.avgMastery),
      userCount: d.userCount
    }));

    res.json(result);
  } catch (error) {
    console.error('getDifficultVerbs error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get day-wise drop-off ====================
// @route   GET /api/admin/drop-off
// @access  Private/Admin
export const getDayWiseDropOff = async (req, res) => {
  try {
    const dropOff = [];
    for (let day = 1; day <= 30; day++) {
      const completed = await DailyProgress.countDocuments({
        day,
        completed: true
      });
      dropOff.push({ day, completed });
    }
    res.json(dropOff);
  } catch (error) {
    console.error('getDayWiseDropOff error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get test statistics ====================
// @route   GET /api/admin/test-stats
// @access  Private/Admin
export const getTestStats = async (req, res) => {
  try {
    const testStats = await TestResult.aggregate([
      {
        $group: {
          _id: '$day',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' },
          maxScore: { $max: '$score' },
          minScore: { $min: '$score' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(testStats);
  } catch (error) {
    console.error('getTestStats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Reset user progress ====================
// @route   POST /api/admin/users/:id/reset
// @access  Private/Admin
export const resetUserProgress = async (req, res) => {
  try {
    const userId = req.params.id;

    await Promise.all([
      UserVerbProgress.deleteMany({ userId }),
      DailyProgress.deleteMany({ userId }),
      TestResult.deleteMany({ userId }),
      User.findByIdAndUpdate(userId, {
        currentCourseDay: 0,
        streak: 0,
        xp: 0,
        level: 1,
        totalVerbsLearned: 0,
        totalVerbsMastered: 0,
        testsCompleted: 0,
        averageTestScore: 0
      })
    ]);

    res.json({ success: true, message: 'User progress reset' });
  } catch (error) {
    console.error('resetUserProgress error:', error);
    res.status(500).json({ message: error.message });
  }
};