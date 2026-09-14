import User from '../models/User.js';
import DailyProgress from '../models/DailyProgress.js';
import Verb from '../models/Verb.js';

// ==================== @desc    Check if user can access a specific day ====================
export const canAccessDay = async (userId, day) => {
  try {
    const user = await User.findById(userId);
    if (!user) return false;

    // Day 1 is always accessible
    if (day === 1) return true;

    // Cannot access future days beyond current + 1
    if (day > user.currentCourseDay + 1) return false;

    // Already completed days are always accessible
    const alreadyCompleted = await DailyProgress.findOne({
      userId,
      day,
      completed: true
    });
    if (alreadyCompleted) return true;

    // If it's a test day (every 7th day), check all previous 6 days are complete
    if (day % 7 === 0) {
      return await areAllPreviousDaysComplete(userId, day - 6, day - 1);
    }

    // If previous day is a test day, check all learning days before it are complete
    const previousDay = day - 1;
    if (previousDay % 7 === 0 && previousDay > 0) {
      const learningDaysComplete = await areAllPreviousDaysComplete(
        userId,
        previousDay - 6,
        previousDay - 1
      );
      const testDayComplete = await isDayCompleted(userId, previousDay);
      return learningDaysComplete && testDayComplete;
    }

    // Regular learning day - check previous day is complete
    return await isDayCompleted(userId, previousDay);
  } catch (error) {
    console.error('canAccessDay error:', error);
    return false;
  }
};

// ==================== @desc    Check if all days in a range are complete ====================
export const areAllPreviousDaysComplete = async (userId, startDay, endDay) => {
  try {
    const daysToCheck = [];
    for (let d = startDay; d <= endDay; d++) {
      daysToCheck.push(d);
    }

    const completedCount = await DailyProgress.countDocuments({
      userId,
      day: { $in: daysToCheck },
      completed: true
    });

    return completedCount === daysToCheck.length;
  } catch (error) {
    console.error('areAllPreviousDaysComplete error:', error);
    return false;
  }
};

// ==================== @desc    Check if a day is completed ====================
export const isDayCompleted = async (userId, day) => {
  try {
    const progress = await DailyProgress.findOne({
      userId,
      day,
      completed: true
    });
    return !!progress;
  } catch (error) {
    console.error('isDayCompleted error:', error);
    return false;
  }
};

// ==================== @desc    Get day progress ====================
export const getDayProgress = async (userId, day) => {
  try {
    const progress = await DailyProgress.findOne({
      userId,
      day
    });
    return progress;
  } catch (error) {
    console.error('getDayProgress error:', error);
    return null;
  }
};

// ==================== @desc    Unlock next day ====================
export const unlockNextDay = async (userId, day) => {
  try {
    // Access is determined dynamically via canAccessDay
    // This function exists for future use if explicit unlock tracking is needed
    return true;
  } catch (error) {
    console.error('unlockNextDay error:', error);
    return false;
  }
};

// ==================== @desc    Get the current unlocked day ====================
export const getCurrentUnlockedDay = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return 0;

    return user.currentCourseDay + 1;
  } catch (error) {
    console.error('getCurrentUnlockedDay error:', error);
    return 0;
  }
};

// ==================== @desc    Get course completion percentage ====================
export const getCourseCompletion = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return 0;

    return Math.round((user.currentCourseDay / 30) * 100);
  } catch (error) {
    console.error('getCourseCompletion error:', error);
    return 0;
  }
};

// ==================== @desc    Check if course is complete ====================
export const isCourseComplete = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return false;

    return user.currentCourseDay >= 30;
  } catch (error) {
    console.error('isCourseComplete error:', error);
    return false;
  }
};

// ==================== @desc    Get day type (learning, test, review, final) ====================
export const getDayType = (day) => {
  if (day === 28) return 'complete-test';
  if (day === 29) return 'revision';
  if (day === 30) return 'final';
  if (day % 7 === 0) return 'test';
  return 'learning';
};

// ==================== @desc    Get next milestone ====================
export const getNextMilestone = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const currentDay = user.currentCourseDay + 1;
    const milestones = [7, 14, 21, 28, 30];

    for (const milestone of milestones) {
      if (currentDay < milestone) {
        return {
          day: milestone,
          type: milestone % 7 === 0 ? 'test' : 'milestone',
          daysAway: milestone - currentDay
        };
      }
    }

    return null;
  } catch (error) {
    console.error('getNextMilestone error:', error);
    return null;
  }
};

// ==================== @desc    Validate day number ====================
export const isValidDay = (day) => {
  const dayNum = parseInt(day);
  return !isNaN(dayNum) && dayNum >= 1 && dayNum <= 30;
};

// ==================== @desc    Get verbs for a day ====================
export const getDayVerbsList = async (day) => {
  try {
    return await Verb.find({ day });
  } catch (error) {
    console.error('getDayVerbsList error:', error);
    return [];
  }
};