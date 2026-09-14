import User from '../models/User.js';
import Verb from '../models/Verb.js';
import DailyProgress from '../models/DailyProgress.js';
import UserVerbProgress from '../models/UserVerbProgress.js';
import Achievement from '../models/Achievement.js';
import { canAccessDay } from '../services/courseService.js';
import { updateStreak } from '../services/streakService.js';
import { addXP, checkAchievements } from '../services/gamificationService.js';

// ==================== @desc    Get current day status ====================
// @route   GET /api/course/current
// @access  Private
export const getCurrentDay = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentDay = user.currentCourseDay + 1;
    const isTestDay = currentDay % 7 === 0 && currentDay > 0;

    // Check if current day is completed
    const progress = await DailyProgress.findOne({
      userId: user._id,
      day: currentDay
    });

    const dayCompleted = progress?.completed || false;

    res.json({
      currentDay,
      isTestDay,
      dayCompleted,
      canAccess: true,
      streak: user.streak,
      xp: user.xp,
      level: user.level,
      totalVerbsLearned: user.totalVerbsLearned,
      totalVerbsMastered: user.totalVerbsMastered,
      testsCompleted: user.testsCompleted,
      averageTestScore: user.averageTestScore
    });
  } catch (error) {
    console.error('getCurrentDay error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get verbs for a specific day ====================
// @route   GET /api/course/day/:day
// @access  Private
export const getDayVerbs = async (req, res) => {
  try {
    const { day } = req.params;
    const userId = req.user._id;
    const dayNum = parseInt(day);

    if (isNaN(dayNum) || dayNum < 1 || dayNum > 30) {
      return res.status(400).json({ message: 'Invalid day number' });
    }

    // Check if user can access this day
    const canAccess = await canAccessDay(userId, dayNum);
    if (!canAccess) {
      return res.status(403).json({ message: 'This day is not unlocked yet. Complete previous days first.' });
    }

    const verbs = await Verb.find({ day: dayNum });

    if (!verbs.length) {
      return res.status(404).json({ message: `No verbs found for day ${dayNum}` });
    }

    // Get user progress for these verbs
    const verbIds = verbs.map(v => v._id);
    const progress = await UserVerbProgress.find({
      userId,
      verbId: { $in: verbIds }
    });

    // Create map of verb progress
    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.verbId.toString()] = p;
    });

    // Combine verb data with progress
    const verbsWithProgress = verbs.map(verb => ({
      ...verb.toObject(),
      progress: progressMap[verb._id.toString()] || null
    }));

    res.json(verbsWithProgress);
  } catch (error) {
    console.error('getDayVerbs error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Complete a day ====================
// @route   POST /api/course/day/complete
// @access  Private
export const completeDay = async (req, res) => {
  try {
    const { day, score, tasksCompleted } = req.body;
    const userId = req.user._id;

    if (!day) {
      return res.status(400).json({ message: 'Day is required' });
    }

    const dayNum = parseInt(day);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate day progression
    if (dayNum > user.currentCourseDay + 1) {
      return res.status(400).json({ 
        message: 'Cannot complete future days. Complete previous days first.' 
      });
    }

    // Check if day already completed
    const existingProgress = await DailyProgress.findOne({
      userId,
      day: dayNum
    });

    if (existingProgress?.completed) {
      return res.status(400).json({ message: 'Day already completed' });
    }

    // Get verbs for this day
    const verbs = await Verb.find({ day: dayNum });

    // Update user verb progress
    for (const verb of verbs) {
      await UserVerbProgress.findOneAndUpdate(
        { userId, verbId: verb._id },
        {
          status: 'learning',
          timesSeen: (existingProgress?.timesSeen || 0) + 1,
          lastReviewedAt: new Date()
        },
        { upsert: true, new: true }
      );
    }

    // Mark day as complete
    const dailyProgress = await DailyProgress.findOneAndUpdate(
      { userId, day: dayNum },
      {
        completed: true,
        score: score || 0,
        tasksCompleted: tasksCompleted || 5,
        totalTasks: 5,
        verbsReviewed: verbs.map(v => v._id),
        completedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Update user's current day
    if (dayNum > user.currentCourseDay) {
      await User.findByIdAndUpdate(userId, {
        currentCourseDay: dayNum
      });
    }

    // Update streak
    const newStreak = await updateStreak(userId);

    // Add XP
    const xpEarned = 50 + (score > 80 ? 20 : 0) + (tasksCompleted === 5 ? 10 : 0);
    await addXP(userId, xpEarned);

    // Check achievements
    const newAchievements = await checkAchievements(userId);

    // Update learned verbs count
    const learnedCount = await UserVerbProgress.countDocuments({
      userId,
      status: { $in: ['learned', 'mastered'] }
    });

    await User.findByIdAndUpdate(userId, {
      totalVerbsLearned: learnedCount
    });

    res.json({
      success: true,
      message: `Day ${dayNum} completed!`,
      xpEarned,
      nextDay: dayNum + 1,
      isTestDay: (dayNum + 1) % 7 === 0,
      streak: newStreak,
      newAchievements: newAchievements.map(a => a.badge),
      dailyProgress
    });
  } catch (error) {
    console.error('completeDay error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get course timeline ====================
// @route   GET /api/course/timeline
// @access  Private
export const getCourseTimeline = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const timeline = [];
    for (let day = 1; day <= 30; day++) {
      const progress = await DailyProgress.findOne({
        userId,
        day,
        completed: true
      });

      const isTestDay = day % 7 === 0;
      const dayVerbs = await Verb.find({ day });

      timeline.push({
        day,
        isTestDay,
        completed: !!progress,
        score: progress?.score || 0,
        verbCount: dayVerbs.length,
        isCurrent: day === user.currentCourseDay + 1,
        isLocked: day > user.currentCourseDay + 1,
        completedAt: progress?.completedAt || null
      });
    }

    res.json(timeline);
  } catch (error) {
    console.error('getCourseTimeline error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get day progress details ====================
// @route   GET /api/course/progress/:day
// @access  Private
export const getDayProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const dayNum = parseInt(req.params.day);

    if (isNaN(dayNum) || dayNum < 1 || dayNum > 30) {
      return res.status(400).json({ message: 'Invalid day number' });
    }

    const progress = await DailyProgress.findOne({
      userId,
      day: dayNum
    }).populate('verbsReviewed', 'v1 v2 v3 meaning');

    if (!progress) {
      return res.status(404).json({ message: 'No progress found for this day' });
    }

    res.json(progress);
  } catch (error) {
    console.error('getDayProgress error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Reset a day ====================
// @route   POST /api/course/reset/:day
// @access  Private
export const resetDay = async (req, res) => {
  try {
    const userId = req.user._id;
    const dayNum = parseInt(req.params.day);

    const progress = await DailyProgress.findOneAndDelete({
      userId,
      day: dayNum
    });

    if (!progress) {
      return res.status(404).json({ message: 'No progress found for this day' });
    }

    res.json({ message: `Day ${dayNum} reset successfully` });
  } catch (error) {
    console.error('resetDay error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get next day info ====================
// @route   GET /api/course/next-day
// @access  Private
export const getNextDay = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const nextDay = user.currentCourseDay + 1;

    if (nextDay > 30) {
      return res.json({
        message: 'Course completed!',
        courseCompleted: true
      });
    }

    const isTestDay = nextDay % 7 === 0;
    const verbs = await Verb.find({ day: nextDay });

    res.json({
      nextDay,
      isTestDay,
      verbCount: verbs.length,
      canAccess: true
    });
  } catch (error) {
    console.error('getNextDay error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Check if day is unlocked ====================
// @route   GET /api/course/check/:day
// @access  Private
export const checkDayUnlock = async (req, res) => {
  try {
    const userId = req.user._id;
    const dayNum = parseInt(req.params.day);

    const canAccess = await canAccessDay(userId, dayNum);

    res.json({
      day: dayNum,
      canAccess
    });
  } catch (error) {
    console.error('checkDayUnlock error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get daily tasks ====================
// @route   GET /api/course/tasks/:day
// @access  Private
export const getDailyTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const dayNum = parseInt(req.params.day);

    const canAccess = await canAccessDay(userId, dayNum);
    if (!canAccess) {
      return res.status(403).json({ message: 'This day is not unlocked yet' });
    }

    const verbs = await Verb.find({ day: dayNum });
    if (!verbs.length) {
      return res.status(404).json({ message: 'No verbs found for this day' });
    }

    const tasks = [
      { id: 'recall_forms', title: 'Task 1: Recall Forms', description: 'Yaad karo V1 → V2 → V3' },
      { id: 'meaning_test', title: 'Task 2: Meaning Test', description: 'English → Hindi meaning' },
      { id: 'translation', title: 'Task 3: Translation', description: 'Hindi → English translation' },
      { id: 'fill_blank', title: 'Task 4: Fill in the Blank', description: 'Complete the sentence' },
      { id: 'sentence_builder', title: 'Task 5: Sentence Builder', description: 'Apna sentence banao' }
    ];

    res.json({ day: dayNum, verbs, tasks });
  } catch (error) {
    console.error('getDailyTasks error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Submit daily task ====================
// @route   POST /api/course/tasks/submit
// @access  Private
export const submitDailyTask = async (req, res) => {
  try {
    const { day, taskId, answers } = req.body;
    const userId = req.user._id;

    // Update daily progress with task answers
    await DailyProgress.findOneAndUpdate(
      { userId, day },
      {
        $push: {
          taskSubmissions: {
            taskId,
            answers,
            submittedAt: new Date()
          }
        }
      },
      { upsert: true }
    );

    res.json({ success: true, message: 'Task submitted' });
  } catch (error) {
    console.error('submitDailyTask error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Mark task complete ====================
// @route   POST /api/course/tasks/complete
// @access  Private
export const markTaskComplete = async (req, res) => {
  try {
    const { day, taskId } = req.body;
    const userId = req.user._id;

    const progress = await DailyProgress.findOne({ userId, day });
    if (!progress) {
      return res.status(404).json({ message: 'Day progress not found' });
    }

    const completedTasks = progress.completedTasks || [];
    if (!completedTasks.includes(taskId)) {
      completedTasks.push(taskId);
    }

    await DailyProgress.findOneAndUpdate(
      { userId, day },
      { completedTasks, tasksCompleted: completedTasks.length }
    );

    res.json({ success: true, completedTasks });
  } catch (error) {
    console.error('markTaskComplete error:', error);
    res.status(500).json({ message: error.message });
  }
};