import User from '../models/User.js';
import Verb from '../models/Verb.js';
import UserVerbProgress from '../models/UserVerbProgress.js';
import TestResult from '../models/TestResult.js';
import DailyProgress from '../models/DailyProgress.js';
import Achievement from '../models/Achievement.js';

// ==================== @desc    Get progress statistics ====================
// @route   GET /api/progress/stats
// @access  Private
export const getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalVerbs = await Verb.countDocuments();
    const learnedVerbs = await UserVerbProgress.countDocuments({
      userId,
      status: { $in: ['learned', 'mastered'] }
    });
    const masteredVerbs = await UserVerbProgress.countDocuments({
      userId,
      status: 'mastered'
    });
    const weakVerbs = await UserVerbProgress.countDocuments({
      userId,
      masteryScore: { $lt: 40 }
    });

    const daysCompleted = await DailyProgress.countDocuments({
      userId,
      completed: true
    });

    const testsCompleted = await TestResult.countDocuments({ userId });

    res.json({
      totalVerbs,
      learnedVerbs,
      masteredVerbs,
      weakVerbs,
      daysCompleted,
      testsCompleted,
      averageScore: user.averageTestScore || 0,
      streak: user.streak || 0,
      xp: user.xp || 0,
      level: user.level || 1,
      currentCourseDay: user.currentCourseDay || 0
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get weak verbs ====================
// @route   GET /api/progress/weak-verbs
// @access  Private
export const getWeakVerbs = async (req, res) => {
  try {
    const userId = req.user._id;

    const weakProgress = await UserVerbProgress.find({
      userId,
      masteryScore: { $lt: 40 }
    })
      .populate('verbId', 'v1 v2 v3 meaning day')
      .sort({ masteryScore: 1 })
      .limit(30);

    const weakVerbs = weakProgress
      .filter(p => p.verbId)
      .map(p => ({
        verbId: p.verbId._id,
        verbName: p.verbId.v1,
        v2: p.verbId.v2,
        v3: p.verbId.v3,
        meaning: p.verbId.meaning,
        day: p.verbId.day,
        masteryScore: p.masteryScore,
        correctAnswers: p.correctAnswers,
        wrongAnswers: p.wrongAnswers,
        status: p.status,
        lastReviewedAt: p.lastReviewedAt,
        nextReviewAt: p.nextReviewAt
      }));

    res.json(weakVerbs);
  } catch (error) {
    console.error('getWeakVerbs error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get verb progress grouped by day ====================
// @route   GET /api/progress/verbs
// @access  Private
export const getVerbProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    const progress = await UserVerbProgress.find({
      userId
    }).populate('verbId', 'v1 day');

    const grouped = {};
    progress.forEach(p => {
      if (!p.verbId) return;
      const day = p.verbId.day;
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push({
        verbName: p.verbId.v1,
        status: p.status,
        masteryScore: p.masteryScore,
        correctAnswers: p.correctAnswers,
        wrongAnswers: p.wrongAnswers
      });
    });

    res.json(grouped);
  } catch (error) {
    console.error('getVerbProgress error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get achievements ====================
// @route   GET /api/progress/achievements
// @access  Private
export const getAchievements = async (req, res) => {
  try {
    const userId = req.user._id;
    const achievements = await Achievement.find({ userId }).sort({ earnedAt: -1 });

    const badgeDetails = {
      '7_day_streak': {
        name: '7 Day Streak',
        icon: '🔥',
        description: 'Maintain a 7-day learning streak'
      },
      '30_verbs_learned': {
        name: '30 Verbs Learned',
        icon: '📚',
        description: 'Learn 30 verbs to mastery'
      },
      'first_weekly_test': {
        name: 'First Weekly Test',
        icon: '🏆',
        description: 'Complete your first weekly test'
      },
      'perfect_score': {
        name: 'Perfect Score',
        icon: '💯',
        description: 'Get 100% on any test'
      },
      '60_verbs': {
        name: '60 Verbs',
        icon: '🚀',
        description: 'Learn 60 verbs to mastery'
      },
      '120_verbs': {
        name: '120 Verbs',
        icon: '👑',
        description: 'Learn all 120 verbs'
      },
      '30_day_challenge': {
        name: '30 Day Challenge',
        icon: '🎯',
        description: 'Complete the full 30-day course'
      }
    };

    const earned = achievements.map(a => ({
      badge: a.badge,
      name: badgeDetails[a.badge]?.name || a.badge,
      icon: badgeDetails[a.badge]?.icon || '🏅',
      description: badgeDetails[a.badge]?.description || '',
      earnedAt: a.earnedAt
    }));

    res.json(earned);
  } catch (error) {
    console.error('getAchievements error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get daily progress ====================
// @route   GET /api/progress/daily
// @access  Private
export const getDailyProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    const progress = await DailyProgress.find({ userId })
      .sort({ day: 1 })
      .populate('verbsReviewed', 'v1');

    res.json(progress);
  } catch (error) {
    console.error('getDailyProgress error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get verb progress by ID ====================
// @route   GET /api/progress/verb/:verbId
// @access  Private
export const getVerbProgressById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { verbId } = req.params;

    const progress = await UserVerbProgress.findOne({
      userId,
      verbId
    }).populate('verbId');

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    res.json(progress);
  } catch (error) {
    console.error('getVerbProgressById error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get mastery breakdown ====================
// @route   GET /api/progress/mastery
// @access  Private
export const getMasteryBreakdown = async (req, res) => {
  try {
    const userId = req.user._id;

    const weak = await UserVerbProgress.countDocuments({ userId, masteryScore: { $lt: 40 } });
    const learning = await UserVerbProgress.countDocuments({
      userId,
      masteryScore: { $gte: 40, $lt: 70 }
    });
    const good = await UserVerbProgress.countDocuments({
      userId,
      masteryScore: { $gte: 70, $lt: 90 }
    });
    const mastered = await UserVerbProgress.countDocuments({
      userId,
      masteryScore: { $gte: 90 }
    });

    res.json({
      weak,
      learning,
      good,
      mastered,
      total: weak + learning + good + mastered
    });
  } catch (error) {
    console.error('getMasteryBreakdown error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get analytics ====================
// @route   GET /api/progress/analytics
// @access  Private
export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const dailyProgress = await DailyProgress.find({ userId, completed: true })
      .sort({ day: 1 })
      .select('day score completedAt');

    const testResults = await TestResult.find({ userId })
      .sort({ completedAt: 1 })
      .select('day score completedAt');

    res.json({
      dailyProgress,
      testResults,
      streak: user.streak,
      xp: user.xp,
      level: user.level,
      averageScore: user.averageTestScore,
      totalDaysCompleted: dailyProgress.length,
      totalTestsCompleted: testResults.length
    });
  } catch (error) {
    console.error('getAnalytics error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get progress chart data ====================
// @route   GET /api/progress/chart
// @access  Private
export const getProgressChart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { from = 1, to = 30 } = req.query;

    const dailyProgress = await DailyProgress.find({
      userId,
      day: { $gte: parseInt(from), $lte: parseInt(to) },
      completed: true
    }).sort({ day: 1 });

    const chartData = dailyProgress.map(p => ({
      day: p.day,
      score: p.score,
      completedAt: p.completedAt
    }));

    res.json(chartData);
  } catch (error) {
    console.error('getProgressChart error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get weak verb recommendations ====================
// @route   GET /api/progress/recommendations
// @access  Private
export const getWeakVerbRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    const weak = await UserVerbProgress.find({
      userId,
      masteryScore: { $lt: 50 }
    })
      .populate('verbId', 'v1 v2 v3 meaning')
      .sort({ masteryScore: 1, wrongAnswers: -1 })
      .limit(10);

    const recommendations = weak
      .filter(w => w.verbId)
      .map(w => ({
        verbId: w.verbId._id,
        verb: w.verbId.v1,
        v2: w.verbId.v2,
        v3: w.verbId.v3,
        meaning: w.verbId.meaning,
        masteryScore: w.masteryScore,
        wrongAnswers: w.wrongAnswers,
        recommendedAction: w.masteryScore < 30 ? 'Start from basics' : 'Practice forms'
      }));

    res.json(recommendations);
  } catch (error) {
    console.error('getWeakVerbRecommendations error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Update verb mastery ====================
// @route   PUT /api/progress/mastery
// @access  Private
export const updateVerbMastery = async (req, res) => {
  try {
    const userId = req.user._id;
    const { verbId, masteryScore } = req.body;

    if (masteryScore < 0 || masteryScore > 100) {
      return res.status(400).json({ message: 'Mastery score must be between 0 and 100' });
    }

    const updated = await UserVerbProgress.findOneAndUpdate(
      { userId, verbId },
      { masteryScore },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Verb progress not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error('updateVerbMastery error:', error);
    res.status(500).json({ message: error.message });
  }
};