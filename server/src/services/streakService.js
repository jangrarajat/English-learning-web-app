import User from '../models/User.js';

// ==================== @desc    Update user streak ====================
export const updateStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = user.lastActivityDate
      ? new Date(user.lastActivityDate)
      : null;

    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0);
      const diffDays = Math.floor(
        (today - lastActivity) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        // Same day - streak unchanged
        return user.streak;
      } else if (diffDays === 1) {
        // Consecutive day - increment streak
        user.streak += 1;
      } else {
        // Streak broken - reset to 1
        user.streak = 1;
      }
    } else {
      // First ever activity
      user.streak = 1;
    }

    user.lastActivityDate = today;
    await user.save();

    return user.streak;
  } catch (error) {
    console.error('updateStreak error:', error);
    return 0;
  }
};

// ==================== @desc    Get current streak ====================
export const getStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user?.streak || 0;
  } catch (error) {
    console.error('getStreak error:', error);
    return 0;
  }
};

// ==================== @desc    Check if streak should be broken ====================
export const checkStreakStatus = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.lastActivityDate) {
      return { streak: 0, isActive: false, daysSinceLastActivity: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = new Date(user.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (today - lastActivity) / (1000 * 60 * 60 * 24)
    );

    return {
      streak: user.streak,
      isActive: diffDays <= 1,
      daysSinceLastActivity: diffDays,
      willBreakIn: Math.max(0, 1 - diffDays)
    };
  } catch (error) {
    console.error('checkStreakStatus error:', error);
    return { streak: 0, isActive: false, daysSinceLastActivity: 0 };
  }
};

// ==================== @desc    Reset streak manually ====================
export const resetStreak = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, {
      streak: 0,
      lastActivityDate: null
    });
    return true;
  } catch (error) {
    console.error('resetStreak error:', error);
    return false;
  }
};

// ==================== @desc    Get streak milestone ====================
export const getStreakMilestone = (streak) => {
  const milestones = [
    { days: 7, badge: '7_day_streak', name: '7 Day Streak', icon: '🔥' },
    { days: 14, badge: null, name: '2 Week Streak', icon: '⭐' },
    { days: 21, badge: null, name: '3 Week Streak', icon: '✨' },
    { days: 30, badge: null, name: '30 Day Streak', icon: '👑' }
  ];

  const achieved = milestones.filter(m => streak >= m.days);
  const next = milestones.find(m => streak < m.days);

  return {
    achieved: achieved[achieved.length - 1] || null,
    next,
    allMilestones: milestones
  };
};

// ==================== @desc    Get streak level (for UI) ====================
export const getStreakLevel = (streak) => {
  if (streak >= 30) return { level: 'Legendary', color: 'purple', emoji: '👑' };
  if (streak >= 21) return { level: 'Amazing', color: 'red', emoji: '🔥' };
  if (streak >= 14) return { level: 'Excellent', color: 'orange', emoji: '⭐' };
  if (streak >= 7) return { level: 'Great', color: 'yellow', emoji: '✨' };
  if (streak >= 3) return { level: 'Good', color: 'green', emoji: '💪' };
  if (streak >= 1) return { level: 'Started', color: 'blue', emoji: '🌱' };
  return { level: 'Start Today', color: 'gray', emoji: '🎯' };
};