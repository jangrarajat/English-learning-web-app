import User from '../models/User.js';
import Verb from '../models/Verb.js';
import UserVerbProgress from '../models/UserVerbProgress.js';
import DailyProgress from '../models/DailyProgress.js';
import TestResult from '../models/TestResult.js';
import Achievement from '../models/Achievement.js';
import { getLevelInfo } from './gamificationService.js';
import { getMasteryLevel, getStatusFromMastery } from './spacedRepetitionService.js';

// ==================== @desc    Get overall user statistics ====================
export const getUserStats = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
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
    const learningVerbs = await UserVerbProgress.countDocuments({
      userId,
      status: 'learning'
    });

    const daysCompleted = await DailyProgress.countDocuments({
      userId,
      completed: true
    });

    const testsCompleted = await TestResult.countDocuments({ userId });

    const levelInfo = getLevelInfo(user.xp || 0);

    return {
      totalVerbs,
      learnedVerbs,
      masteredVerbs,
      weakVerbs,
      learningVerbs,
      daysCompleted,
      testsCompleted,
      averageScore: user.averageTestScore || 0,
      streak: user.streak || 0,
      xp: user.xp || 0,
      level: user.level || 1,
      levelInfo,
      currentCourseDay: user.currentCourseDay || 0,
      courseProgress: Math.round(((user.currentCourseDay || 0) / 30) * 100),
      verbProgress: totalVerbs > 0 ? Math.round((learnedVerbs / totalVerbs) * 100) : 0,
      masteryProgress: totalVerbs > 0 ? Math.round((masteredVerbs / totalVerbs) * 100) : 0
    };
  } catch (error) {
    console.error('getUserStats error:', error);
    throw error;
  }
};

// ==================== @desc    Get weak verbs for user ====================
export const getWeakVerbsForUser = async (userId, limit = 30) => {
  try {
    const weakProgress = await UserVerbProgress.find({
      userId,
      masteryScore: { $lt: 40 }
    })
      .populate('verbId', 'v1 v2 v3 meaning day pronunciation')
      .sort({ masteryScore: 1, wrongAnswers: -1 })
      .limit(limit);

    return weakProgress
      .filter(p => p.verbId)
      .map(p => ({
        verbId: p.verbId._id,
        verbName: p.verbId.v1,
        v1: p.verbId.v1,
        v2: p.verbId.v2,
        v3: p.verbId.v3,
        meaning: p.verbId.meaning,
        day: p.verbId.day,
        pronunciation: p.verbId.pronunciation,
        masteryScore: p.masteryScore || 0,
        correctAnswers: p.correctAnswers || 0,
        wrongAnswers: p.wrongAnswers || 0,
        status: p.status,
        lastReviewedAt: p.lastReviewedAt,
        nextReviewAt: p.nextReviewAt,
        timesSeen: p.timesSeen || 0,
        masteryLevel: getMasteryLevel(p.masteryScore || 0)
      }));
  } catch (error) {
    console.error('getWeakVerbsForUser error:', error);
    return [];
  }
};

// ==================== @desc    Get verb progress grouped by day ====================
export const getVerbProgressByDay = async (userId) => {
  try {
    const progress = await UserVerbProgress.find({ userId })
      .populate('verbId', 'v1 day');

    const grouped = {};

    progress.forEach(p => {
      if (!p.verbId) return;

      const day = p.verbId.day;
      if (!grouped[day]) {
        grouped[day] = {
          day,
          total: 0,
          learning: 0,
          learned: 0,
          mastered: 0,
          revising: 0,
          weak: 0,
          verbs: []
        };
      }

      grouped[day].total++;
      grouped[day][p.status] = (grouped[day][p.status] || 0) + 1;

      if ((p.masteryScore || 0) < 40) {
        grouped[day].weak++;
      }

      grouped[day].verbs.push({
        verbName: p.verbId.v1,
        status: p.status,
        masteryScore: p.masteryScore || 0,
        correctAnswers: p.correctAnswers || 0,
        wrongAnswers: p.wrongAnswers || 0
      });
    });

    return grouped;
  } catch (error) {
    console.error('getVerbProgressByDay error:', error);
    return {};
  }
};

// ==================== @desc    Get mastery breakdown ====================
export const getMasteryBreakdown = async (userId) => {
  try {
    const weak = await UserVerbProgress.countDocuments({
      userId,
      masteryScore: { $gte: 0, $lt: 40 }
    });
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

    const totalTracked = weak + learning + good + mastered;
    const totalVerbs = await Verb.countDocuments();
    const notStarted = totalVerbs - totalTracked;

    return {
      weak,
      learning,
      good,
      mastered,
      notStarted: notStarted > 0 ? notStarted : 0,
      total: totalVerbs,
      totalTracked,
      percentages: {
        weak: totalVerbs > 0 ? Math.round((weak / totalVerbs) * 100) : 0,
        learning: totalVerbs > 0 ? Math.round((learning / totalVerbs) * 100) : 0,
        good: totalVerbs > 0 ? Math.round((good / totalVerbs) * 100) : 0,
        mastered: totalVerbs > 0 ? Math.round((mastered / totalVerbs) * 100) : 0,
        notStarted: totalVerbs > 0 ? Math.round((notStarted / totalVerbs) * 100) : 0
      }
    };
  } catch (error) {
    console.error('getMasteryBreakdown error:', error);
    return {
      weak: 0,
      learning: 0,
      good: 0,
      mastered: 0,
      notStarted: 0,
      total: 0,
      totalTracked: 0,
      percentages: {
        weak: 0,
        learning: 0,
        good: 0,
        mastered: 0,
        notStarted: 0
      }
    };
  }
};

// ==================== @desc    Get daily progress for user ====================
export const getDailyProgressForUser = async (userId) => {
  try {
    const progress = await DailyProgress.find({ userId })
      .sort({ day: 1 })
      .populate('verbsReviewed', 'v1');

    return progress.map(p => ({
      day: p.day,
      completed: p.completed,
      score: p.score || 0,
      tasksCompleted: p.tasksCompleted || 0,
      totalTasks: p.totalTasks || 5,
      verbsReviewed: p.verbsReviewed?.map(v => v.v1) || [],
      completedAt: p.completedAt
    }));
  } catch (error) {
    console.error('getDailyProgressForUser error:', error);
    return [];
  }
};

// ==================== @desc    Get analytics data for user ====================
export const getUserAnalytics = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const dailyProgress = await DailyProgress.find({
      userId,
      completed: true
    })
      .sort({ day: 1 })
      .select('day score completedAt');

    const testResults = await TestResult.find({ userId })
      .sort({ completedAt: 1 })
      .select('day score testType completedAt');

    // Calculate weekly progress
    const weeklyProgress = calculateWeeklyProgress(dailyProgress);

    // Calculate score trend
    const scoreTrend = testResults.map(t => ({
      day: t.day,
      score: t.score,
      date: t.completedAt
    }));

    return {
      dailyProgress,
      testResults,
      weeklyProgress,
      scoreTrend,
      streak: user.streak || 0,
      xp: user.xp || 0,
      level: user.level || 1,
      averageScore: user.averageTestScore || 0,
      totalDaysCompleted: dailyProgress.length,
      totalTestsCompleted: testResults.length
    };
  } catch (error) {
    console.error('getUserAnalytics error:', error);
    return {
      dailyProgress: [],
      testResults: [],
      weeklyProgress: [],
      scoreTrend: [],
      streak: 0,
      xp: 0,
      level: 1,
      averageScore: 0,
      totalDaysCompleted: 0,
      totalTestsCompleted: 0
    };
  }
};

// ==================== @desc    Calculate weekly progress ====================
const calculateWeeklyProgress = (dailyProgress) => {
  const weeks = [];

  for (let week = 0; week < 5; week++) {
    const startDay = week * 7 + 1;
    const endDay = Math.min((week + 1) * 7, 30);

    const weekDays = dailyProgress.filter(
      p => p.day >= startDay && p.day <= endDay
    );

    const avgScore = weekDays.length > 0
      ? Math.round(
          weekDays.reduce((sum, d) => sum + d.score, 0) / weekDays.length
        )
      : 0;

    weeks.push({
      week: week + 1,
      startDay,
      endDay,
      completedDays: weekDays.length,
      totalDays: endDay - startDay + 1,
      avgScore
    });
  }

  return weeks;
};

// ==================== @desc    Get progress chart data ====================
export const getProgressChartData = async (userId, from = 1, to = 30) => {
  try {
    const dailyProgress = await DailyProgress.find({
      userId,
      day: { $gte: parseInt(from), $lte: parseInt(to) }
    }).sort({ day: 1 });

    const testResults = await TestResult.find({
      userId,
      day: { $gte: parseInt(from), $lte: parseInt(to) }
    }).sort({ day: 1 });

    // Build chart data for each day
    const chartData = [];
    for (let day = parseInt(from); day <= parseInt(to); day++) {
      const daily = dailyProgress.find(p => p.day === day);
      const test = testResults.find(t => t.day === day);

      chartData.push({
        day,
        completed: daily?.completed || false,
        score: daily?.score || 0,
        testScore: test?.score || null,
        isTestDay: day % 7 === 0
      });
    }

    return chartData;
  } catch (error) {
    console.error('getProgressChartData error:', error);
    return [];
  }
};

// ==================== @desc    Get verb progress by ID ====================
export const getVerbProgressById = async (userId, verbId) => {
  try {
    const progress = await UserVerbProgress.findOne({
      userId,
      verbId
    }).populate('verbId');

    if (!progress) {
      return null;
    }

    return {
      ...progress.toObject(),
      masteryLevel: getMasteryLevel(progress.masteryScore || 0)
    };
  } catch (error) {
    console.error('getVerbProgressById error:', error);
    return null;
  }
};

// ==================== @desc    Update verb mastery manually ====================
export const updateVerbMasteryScore = async (userId, verbId, masteryScore) => {
  try {
    if (masteryScore < 0 || masteryScore > 100) {
      throw new Error('Mastery score must be between 0 and 100');
    }

    const status = getStatusFromMastery(masteryScore);

    const updated = await UserVerbProgress.findOneAndUpdate(
      { userId, verbId },
      {
        masteryScore,
        status,
        lastReviewedAt: new Date()
      },
      { new: true, upsert: true }
    );

    return updated;
  } catch (error) {
    console.error('updateVerbMasteryScore error:', error);
    throw error;
  }
};

// ==================== @desc    Get weak verb recommendations ====================
export const getWeakVerbRecommendations = async (userId, limit = 10) => {
  try {
    const weak = await UserVerbProgress.find({
      userId,
      masteryScore: { $lt: 50 }
    })
      .populate('verbId', 'v1 v2 v3 meaning day')
      .sort({ masteryScore: 1, wrongAnswers: -1 })
      .limit(limit);

    return weak
      .filter(w => w.verbId)
      .map(w => ({
        verbId: w.verbId._id,
        verb: w.verbId.v1,
        v2: w.verbId.v2,
        v3: w.verbId.v3,
        meaning: w.verbId.meaning,
        day: w.verbId.day,
        masteryScore: w.masteryScore || 0,
        wrongAnswers: w.wrongAnswers || 0,
        correctAnswers: w.correctAnswers || 0,
        recommendedAction:
          (w.masteryScore || 0) < 30
            ? 'Start from basics'
            : (w.masteryScore || 0) < 50
            ? 'Practice forms'
            : 'Quick review'
      }));
  } catch (error) {
    console.error('getWeakVerbRecommendations error:', error);
    return [];
  }
};

// ==================== @desc    Get user achievements ====================
export const getUserAchievements = async (userId) => {
  try {
    const achievements = await Achievement.find({ userId })
      .sort({ earnedAt: -1 });

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

    return achievements.map(a => ({
      badge: a.badge,
      name: badgeDetails[a.badge]?.name || a.badge,
      icon: badgeDetails[a.badge]?.icon || '🏅',
      description: badgeDetails[a.badge]?.description || '',
      earnedAt: a.earnedAt
    }));
  } catch (error) {
    console.error('getUserAchievements error:', error);
    return [];
  }
};

// ==================== @desc    Get achievement progress ====================
export const getAchievementProgress = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const learnedCount = await UserVerbProgress.countDocuments({
      userId,
      status: { $in: ['learned', 'mastered'] }
    });

    return {
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
        percentage: (user.testsCompleted || 0) > 0 ? 100 : 0
      },
      'perfect_score': {
        current: 0,
        target: 1,
        percentage: 0
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
  } catch (error) {
    console.error('getAchievementProgress error:', error);
    return {};
  }
};

// ==================== @desc    Get overall progress summary ====================
export const getProgressSummary = async (userId) => {
  try {
    const [stats, weakVerbs, masteryBreakdown, achievements] = await Promise.all([
      getUserStats(userId),
      getWeakVerbsForUser(userId, 5),
      getMasteryBreakdown(userId),
      getUserAchievements(userId)
    ]);

    return {
      stats,
      weakVerbs,
      masteryBreakdown,
      achievements,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('getProgressSummary error:', error);
    throw error;
  }
};

// ==================== @desc    Get progress comparison (this week vs last week) ====================
export const getProgressComparison = async (userId) => {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const thisWeek = await DailyProgress.countDocuments({
      userId,
      completed: true,
      completedAt: { $gte: oneWeekAgo }
    });

    const lastWeek = await DailyProgress.countDocuments({
      userId,
      completed: true,
      completedAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo }
    });

    const thisWeekTests = await TestResult.find({
      userId,
      completedAt: { $gte: oneWeekAgo }
    });

    const lastWeekTests = await TestResult.find({
      userId,
      completedAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo }
    });

    const thisWeekAvg = thisWeekTests.length > 0
      ? Math.round(thisWeekTests.reduce((sum, t) => sum + t.score, 0) / thisWeekTests.length)
      : 0;

    const lastWeekAvg = lastWeekTests.length > 0
      ? Math.round(lastWeekTests.reduce((sum, t) => sum + t.score, 0) / lastWeekTests.length)
      : 0;

    return {
      thisWeek: {
        daysCompleted: thisWeek,
        testsCompleted: thisWeekTests.length,
        avgScore: thisWeekAvg
      },
      lastWeek: {
        daysCompleted: lastWeek,
        testsCompleted: lastWeekTests.length,
        avgScore: lastWeekAvg
      },
      improvement: {
        days: thisWeek - lastWeek,
        avgScore: thisWeekAvg - lastWeekAvg
      }
    };
  } catch (error) {
    console.error('getProgressComparison error:', error);
    return {
      thisWeek: { daysCompleted: 0, testsCompleted: 0, avgScore: 0 },
      lastWeek: { daysCompleted: 0, testsCompleted: 0, avgScore: 0 },
      improvement: { days: 0, avgScore: 0 }
    };
  }
};

// ==================== @desc    Reset all user progress ====================
export const resetUserProgress = async (userId) => {
  try {
    await Promise.all([
      UserVerbProgress.deleteMany({ userId }),
      DailyProgress.deleteMany({ userId }),
      TestResult.deleteMany({ userId }),
      Achievement.deleteMany({ userId }),
      User.findByIdAndUpdate(userId, {
        currentCourseDay: 0,
        streak: 0,
        xp: 0,
        level: 1,
        totalVerbsLearned: 0,
        totalVerbsMastered: 0,
        testsCompleted: 0,
        averageTestScore: 0,
        lastActivityDate: null
      })
    ]);

    return true;
  } catch (error) {
    console.error('resetUserProgress error:', error);
    throw error;
  }
};