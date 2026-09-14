import Achievement from '../models/Achievement.js';
import User from '../models/User.js';
import UserVerbProgress from '../models/UserVerbProgress.js';

// ==================== Badge Definitions ====================
const ALL_BADGES = {
  '7_day_streak': {
    id: '7_day_streak',
    name: '7 Day Streak',
    icon: '🔥',
    description: 'Maintain a 7-day learning streak',
    requirement: 'Complete activities for 7 consecutive days'
  },
  '30_verbs_learned': {
    id: '30_verbs_learned',
    name: '30 Verbs Learned',
    icon: '📚',
    description: 'Learn 30 verbs to mastery',
    requirement: 'Master 30 verbs'
  },
  'first_weekly_test': {
    id: 'first_weekly_test',
    name: 'First Weekly Test',
    icon: '🏆',
    description: 'Complete your first weekly test',
    requirement: 'Complete Day 7 test'
  },
  'perfect_score': {
    id: 'perfect_score',
    name: 'Perfect Score',
    icon: '💯',
    description: 'Get 100% on any test',
    requirement: 'Score 100% on a test'
  },
  '60_verbs': {
    id: '60_verbs',
    name: '60 Verbs',
    icon: '🚀',
    description: 'Learn 60 verbs to mastery',
    requirement: 'Master 60 verbs'
  },
  '120_verbs': {
    id: '120_verbs',
    name: '120 Verbs',
    icon: '👑',
    description: 'Learn all 120 verbs',
    requirement: 'Master all 120 verbs'
  },
  '30_day_challenge': {
    id: '30_day_challenge',
    name: '30 Day Challenge',
    icon: '🎯',
    description: 'Complete the full 30-day course',
    requirement: 'Complete all 30 days'
  }
};

// ==================== @desc    Get all achievements ====================
// @route   GET /api/achievements
// @access  Private
export const getAllAchievements = async (req, res) => {
  try {
    const userId = req.user._id;
    const earned = await Achievement.find({ userId }).sort({ earnedAt: -1 });
    const earnedBadgeIds = earned.map(a => a.badge);

    const allBadges = Object.values(ALL_BADGES).map(badge => ({
      ...badge,
      earned: earnedBadgeIds.includes(badge.id),
      earnedAt: earned.find(e => e.badge === badge.id)?.earnedAt || null
    }));

    res.json({
      total: allBadges.length,
      earned: earned.length,
      badges: allBadges
    });
  } catch (error) {
    console.error('getAllAchievements error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get earned achievements ====================
// @route   GET /api/achievements/earned
// @access  Private
export const getEarnedAchievements = async (req, res) => {
  try {
    const userId = req.user._id;
    const earned = await Achievement.find({ userId }).sort({ earnedAt: -1 });

    const badges = earned.map(a => ({
      ...ALL_BADGES[a.badge],
      earnedAt: a.earnedAt
    })).filter(b => b.id);

    res.json(badges);
  } catch (error) {
    console.error('getEarnedAchievements error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get locked achievements ====================
// @route   GET /api/achievements/locked
// @access  Private
export const getLockedAchievements = async (req, res) => {
  try {
    const userId = req.user._id;
    const earned = await Achievement.find({ userId });
    const earnedBadgeIds = earned.map(a => a.badge);

    const locked = Object.values(ALL_BADGES)
      .filter(b => !earnedBadgeIds.includes(b.id))
      .map(b => ({ ...b, earned: false }));

    res.json(locked);
  } catch (error) {
    console.error('getLockedAchievements error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get achievement by ID ====================
// @route   GET /api/achievements/:id
// @access  Private
export const getAchievementById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const badge = ALL_BADGES[id];
    if (!badge) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    const earned = await Achievement.findOne({ userId, badge: id });

    res.json({
      ...badge,
      earned: !!earned,
      earnedAt: earned?.earnedAt || null
    });
  } catch (error) {
    console.error('getAchievementById error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Claim achievement ====================
// @route   POST /api/achievements/claim/:badgeId
// @access  Private
export const claimAchievement = async (req, res) => {
  try {
    const userId = req.user._id;
    const { badgeId } = req.params;

    const badge = ALL_BADGES[badgeId];
    if (!badge) {
      return res.status(404).json({ message: 'Invalid badge' });
    }

    // Check if already earned
    const existing = await Achievement.findOne({ userId, badge: badgeId });
    if (existing) {
      return res.status(400).json({ message: 'Achievement already claimed' });
    }

    // Verify user qualifies for this badge
    const user = await User.findById(userId);
    const learnedCount = await UserVerbProgress.countDocuments({
      userId,
      status: { $in: ['learned', 'mastered'] }
    });

    let qualifies = false;
    switch (badgeId) {
      case '7_day_streak':
        qualifies = user.streak >= 7;
        break;
      case '30_verbs_learned':
        qualifies = learnedCount >= 30;
        break;
      case 'first_weekly_test':
        qualifies = user.testsCompleted >= 1;
        break;
      case '60_verbs':
        qualifies = learnedCount >= 60;
        break;
      case '120_verbs':
        qualifies = learnedCount >= 120;
        break;
      case '30_day_challenge':
        qualifies = user.currentCourseDay >= 30;
        break;
      default:
        qualifies = false;
    }

    if (!qualifies) {
      return res.status(400).json({ message: 'You do not qualify for this achievement yet' });
    }

    const achievement = await Achievement.create({ userId, badge: badgeId });

    res.status(201).json({
      success: true,
      achievement: {
        ...badge,
        earnedAt: achievement.earnedAt
      }
    });
  } catch (error) {
    console.error('claimAchievement error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get achievement progress ====================
// @route   GET /api/achievements/progress
// @access  Private
export const getAchievementProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const learnedCount = await UserVerbProgress.countDocuments({
      userId,
      status: { $in: ['learned', 'mastered'] }
    });

    const progress = {
      '7_day_streak': {
        current: Math.min(user.streak || 0, 7),
        target: 7,
        percentage: Math.min(((user.streak || 0) / 7) * 100, 100)
      },
      '30_verbs_learned': {
        current: Math.min(learnedCount, 30),
        target: 30,
        percentage: Math.min((learnedCount / 30) * 100, 100)
      },
      'first_weekly_test': {
        current: Math.min(user.testsCompleted || 0, 1),
        target: 1,
        percentage: user.testsCompleted > 0 ? 100 : 0
      },
      '60_verbs': {
        current: Math.min(learnedCount, 60),
        target: 60,
        percentage: Math.min((learnedCount / 60) * 100, 100)
      },
      '120_verbs': {
        current: Math.min(learnedCount, 120),
        target: 120,
        percentage: Math.min((learnedCount / 120) * 100, 100)
      },
      '30_day_challenge': {
        current: Math.min(user.currentCourseDay || 0, 30),
        target: 30,
        percentage: Math.min(((user.currentCourseDay || 0) / 30) * 100, 100)
      }
    };

    res.json(progress);
  } catch (error) {
    console.error('getAchievementProgress error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get recent achievements ====================
// @route   GET /api/achievements/recent?limit=5
// @access  Private
export const getRecentAchievements = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 5 } = req.query;

    const recent = await Achievement.find({ userId })
      .sort({ earnedAt: -1 })
      .limit(parseInt(limit));

    const badges = recent.map(a => ({
      ...ALL_BADGES[a.badge],
      earnedAt: a.earnedAt
    })).filter(b => b.id);

    res.json(badges);
  } catch (error) {
    console.error('getRecentAchievements error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get next achievable badge ====================
// @route   GET /api/achievements/next
// @access  Private
export const getNextAchievement = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const learnedCount = await UserVerbProgress.countDocuments({
      userId,
      status: { $in: ['learned', 'mastered'] }
    });
    const earned = await Achievement.find({ userId });
    const earnedBadgeIds = earned.map(a => a.badge);

    // Calculate progress for each badge
    const candidates = [
      { id: '7_day_streak', progress: (user.streak || 0) / 7 },
      { id: '30_verbs_learned', progress: learnedCount / 30 },
      { id: 'first_weekly_test', progress: user.testsCompleted > 0 ? 1 : 0 },
      { id: '60_verbs', progress: learnedCount / 60 },
      { id: '120_verbs', progress: learnedCount / 120 },
      { id: '30_day_challenge', progress: (user.currentCourseDay || 0) / 30 }
    ]
      .filter(c => !earnedBadgeIds.includes(c.id))
      .sort((a, b) => b.progress - a.progress);

    if (!candidates.length) {
      return res.json({ message: 'All badges earned! 🎉' });
    }

    const next = candidates[0];
    res.json({
      ...ALL_BADGES[next.id],
      currentProgress: Math.round(next.progress * 100)
    });
  } catch (error) {
    console.error('getNextAchievement error:', error);
    res.status(500).json({ message: error.message });
  }
};