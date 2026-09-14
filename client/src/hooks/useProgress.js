import { useState, useEffect, useCallback } from 'react';
import { getStats, getWeakVerbs, getDailyProgress, getAchievements } from '../api/progress';
import { getCurrentDay } from '../api/course';

export const useProgress = () => {
  const [stats, setStats] = useState(null);
  const [weakVerbs, setWeakVerbs] = useState([]);
  const [dailyProgress, setDailyProgress] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [currentDay, setCurrentDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, weakRes, dailyRes, achievementsRes, currentRes] = await Promise.all([
        getStats(),
        getWeakVerbs(),
        getDailyProgress(),
        getAchievements(),
        getCurrentDay()
      ]);

      setStats(statsRes.data);
      setWeakVerbs(weakRes.data);
      setDailyProgress(dailyRes.data);
      setAchievements(achievementsRes.data);
      setCurrentDay(currentRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch progress data');
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const refetch = useCallback(() => {
    return fetchProgress();
  }, [fetchProgress]);

  const getVerbProgress = useCallback((verbId) => {
    // Find verb progress from daily progress
    for (const day of dailyProgress) {
      if (day.verbsReviewed && day.verbsReviewed.includes(verbId)) {
        return {
          day: day.day,
          score: day.score,
          completed: day.completed
        };
      }
    }
    return null;
  }, [dailyProgress]);

  const getDayProgress = useCallback((day) => {
    return dailyProgress.find(d => d.day === day) || null;
  }, [dailyProgress]);

  const getWeakVerbsList = useCallback(() => {
    return weakVerbs;
  }, [weakVerbs]);

  const getAchievementsList = useCallback(() => {
    return achievements;
  }, [achievements]);

  const hasAchievement = useCallback((badgeId) => {
    return achievements.some(a => a.badge === badgeId);
  }, [achievements]);

  const getTotalVerbsLearned = useCallback(() => {
    return stats?.learnedVerbs || 0;
  }, [stats]);

  const getTotalVerbsMastered = useCallback(() => {
    return stats?.masteredVerbs || 0;
  }, [stats]);

  const getAverageScore = useCallback(() => {
    return stats?.averageScore || 0;
  }, [stats]);

  const getDaysCompleted = useCallback(() => {
    return stats?.daysCompleted || 0;
  }, [stats]);

  const getTestsCompleted = useCallback(() => {
    return stats?.testsCompleted || 0;
  }, [stats]);

  const getStreak = useCallback(() => {
    return stats?.streak || 0;
  }, [stats]);

  const getXP = useCallback(() => {
    return stats?.xp || 0;
  }, [stats]);

  const getLevel = useCallback(() => {
    return stats?.level || 1;
  }, [stats]);

  return {
    stats,
    weakVerbs,
    dailyProgress,
    achievements,
    currentDay,
    loading,
    error,
    refetch,
    getVerbProgress,
    getDayProgress,
    getWeakVerbsList,
    getAchievementsList,
    hasAchievement,
    getTotalVerbsLearned,
    getTotalVerbsMastered,
    getAverageScore,
    getDaysCompleted,
    getTestsCompleted,
    getStreak,
    getXP,
    getLevel
  };
};