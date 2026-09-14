import User from '../models/User.js';
import Achievement from '../models/Achievement.js';
import UserVerbProgress from '../models/UserVerbProgress.js';

// ==================== XP Configuration ====================
const XP_VALUES = {
  LEARN_VERB: 10,
  DAILY_TASK: 20,
  DAILY_TEST: 50,
  WEEKLY_TEST: 100,
  PERFECT_SCORE_BONUS: 50,
  STREAK_BONUS: 10,
  COMPLETE_DAY: 20,
  PRACTICE_SESSION: 10,
  QUICK_PRACTICE: 5
};

// ==================== Level Thresholds ====================
const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, name: 'Beginner' },
  { level: 2, xp: 200, name: 'Learner' },
  { level: 3, xp: 400, name: 'Explorer' },
  { level: 4, xp: 600, name: 'Builder' },
  { level: 5, xp: 800, name: 'Speaker' },
  { level: 6, xp: 1000, name: 'Verb Master' }
];

// ==================== @desc    Add XP to user ====================
export const addXP = async (userId, amount) => {
  try {
    const user = await User.findById(userId);
    if (!user) return 0;

    user.xp = (user.xp || 0) + amount;

    // Calculate new level
    const newLevel = calculateLevel(user.xp);
    if (newLevel > (user.level || 1)) {
      user.level = newLevel;
    }

    await user.save();
    return user.xp;
  } catch (error) {
    console.error('addXP error:', error);
    return 0;
  }
};

// ==================== @desc    Calculate level from XP ====================
export const calculateLevel = (xp) => {
  let level = 1;
  for (const threshold of LEVEL_THRESHOLDS) {
    if (xp >= threshold.xp) {
      level = threshold.level;
    }
  }
  return level;
};

// ==================== @desc    Get level info ====================
export const getLevelInfo = (xp) => {
  const level = calculateLevel(xp);
  const currentThreshold = LEVEL_THRESHOLDS.find(t => t.level === level);
  const nextThreshold = LEVEL_THRESHOLDS.find(t => t.level === level + 1);

  const xpInLevel = xp - (currentThreshold?.xp || 0);
  const xpForNext = nextThreshold
    ? nextThreshold.xp - (currentThreshold?.xp || 0)
    : 200;

  return {
    level,
    levelName: currentThreshold?.name || 'Verb Master',
    xp,
    xpInLevel,
    xpForNext,
    progress: Math.min((xpInLevel / xpForNext) * 100, 100),
    nextLevelXP: nextThreshold?.xp || null
  };
};

// ==================== @desc    Check and award achievements ====================
export const checkAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const existingAchievements = await Achievement.find({ userId });
    const earnedBadges = existingAchievements.map(a => a.badge);

    const learnedCount = await UserVerbProgress.countDocuments({
      userId,
      status: { $in: ['learned', 'mastered'] }
    });

    const newAchievements = [];

    // 7 Day Streak
    if (user.streak >= 7 && !earnedBadges.includes('7_day_streak')) {
      newAchievements.push('7_day_streak');
    }

    // 30 Verbs Learned
    if (learnedCount >= 30 && !earnedBadges.includes('30_verbs_learned')) {
      newAchievements.push('30_verbs_learned');
    }

    // First Weekly Test
    if (user.testsCompleted >= 1 && !earnedBadges.includes('first_weekly_test')) {
      newAchievements.push('first_weekly_test');
    }

    // 60 Verbs
    if (learnedCount >= 60 && !earnedBadges.includes('60_verbs')) {
      newAchievements.push('60_verbs');
    }

    // 120 Verbs
    if (learnedCount >= 120 && !earnedBadges.includes('120_verbs')) {
      newAchievements.push('120_verbs');
    }

    // 30 Day Challenge
    if (user.currentCourseDay >= 30 && !earnedBadges.includes('30_day_challenge')) {
      newAchievements.push('30_day_challenge');
    }

    // Save new achievements
    const created = [];
    for (const badge of newAchievements) {
      const achievement = await Achievement.create({ userId, badge });
      created.push(achievement);
    }

    return created;
  } catch (error) {
    console.error('checkAchievements error:', error);
    return [];
  }
};

// ==================== @desc    Check for perfect score achievement ====================
export const checkPerfectScore = async (userId, score) => {
  try {
    if (score !== 100) return null;

    const existing = await Achievement.findOne({
      userId,
      badge: 'perfect_score'
    });

    if (existing) return null;

    return await Achievement.create({
      userId,
      badge: 'perfect_score'
    });
  } catch (error) {
    console.error('checkPerfectScore error:', error);
    return null;
  }
};

// ==================== @desc    Award XP for completing a day ====================
export const awardDayXP = async (userId, score, tasksCompleted) => {
  let xp = XP_VALUES.LEARN_VERB * 5; // Base for 5 verbs

  if (score > 80) xp += XP_VALUES.PERFECT_SCORE_BONUS;
  if (tasksCompleted === 5) xp += XP_VALUES.DAILY_TASK;
  xp += XP_VALUES.COMPLETE_DAY;

  return await addXP(userId, xp);
};

// ==================== @desc    Award XP for test ====================
export const awardTestXP = async (userId, score, isWeekly = false) => {
  let xp = isWeekly ? XP_VALUES.WEEKLY_TEST : XP_VALUES.DAILY_TEST;

  if (score === 100) xp += XP_VALUES.PERFECT_SCORE_BONUS;
  else if (score >= 80) xp += 20;

  return await addXP(userId, xp);
};

// ==================== @desc    Award XP for practice ====================
export const awardPracticeXP = async (userId, score) => {
  let xp = XP_VALUES.PRACTICE_SESSION;
  if (score === 100) xp += 10;
  return await addXP(userId, xp);
};

// ==================== @desc    Get user's total XP and level ====================
export const getUserLevel = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    return getLevelInfo(user.xp || 0);
  } catch (error) {
    console.error('getUserLevel error:', error);
    return null;
  }
};

// ==================== @desc    Get XP for next level ====================
export const getXPToNextLevel = (xp) => {
  const level = calculateLevel(xp);
  const nextThreshold = LEVEL_THRESHOLDS.find(t => t.level === level + 1);

  if (!nextThreshold) return 0;
  return nextThreshold.xp - xp;
};

// ==================== @desc    Get all badges with status ====================
export const getAllBadgesWithStatus = async (userId) => {
  try {
    const earned = await Achievement.find({ userId });
    const earnedIds = earned.map(a => a.badge);

    const allBadges = [
      { id: '7_day_streak', name: '7 Day Streak', icon: '🔥' },
      { id: '30_verbs_learned', name: '30 Verbs Learned', icon: '📚' },
      { id: 'first_weekly_test', name: 'First Weekly Test', icon: '🏆' },
      { id: 'perfect_score', name: 'Perfect Score', icon: '💯' },
      { id: '60_verbs', name: '60 Verbs', icon: '🚀' },
      { id: '120_verbs', name: '120 Verbs', icon: '👑' },
      { id: '30_day_challenge', name: '30 Day Challenge', icon: '🎯' }
    ];

    return allBadges.map(badge => ({
      ...badge,
      earned: earnedIds.includes(badge.id),
      earnedAt: earned.find(e => e.badge === badge.id)?.earnedAt || null
    }));
  } catch (error) {
    console.error('getAllBadgesWithStatus error:', error);
    return [];
  }
};

// ==================== Export constants ====================
export { XP_VALUES, LEVEL_THRESHOLDS };