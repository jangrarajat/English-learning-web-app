import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Award, 
  Medal,
  Sparkles,
  Lock,
  CheckCircle,
  TrendingUp,
  BookOpen,
  Target,
  Calendar
} from 'lucide-react';
import { getAchievements } from '../api/progress';
import { getStats } from '../api/progress';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [achievementsRes, statsRes] = await Promise.all([
          getAchievements(),
          getStats()
        ]);
        setAchievements(achievementsRes.data);
        setStats(statsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching achievements:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const allBadges = [
    {
      id: '7_day_streak',
      icon: '🔥',
      name: '7 Day Streak',
      description: 'Maintain a 7-day learning streak',
      requirement: 'Complete activities for 7 consecutive days',
      check: () => stats?.streak >= 7
    },
    {
      id: '30_verbs_learned',
      icon: '📚',
      name: '30 Verbs Learned',
      description: 'Learn 30 verbs',
      requirement: 'Learn 30 verbs to mastery',
      check: () => stats?.learnedVerbs >= 30
    },
    {
      id: 'first_weekly_test',
      icon: '🏆',
      name: 'First Weekly Test',
      description: 'Complete your first weekly test',
      requirement: 'Complete Day 7 test',
      check: () => stats?.testsCompleted >= 1
    },
    {
      id: 'perfect_score',
      icon: '💯',
      name: 'Perfect Score',
      description: 'Get 100% on any test',
      requirement: 'Score 100% on a test',
      check: () => stats?.averageScore === 100
    },
    {
      id: '60_verbs',
      icon: '🚀',
      name: '60 Verbs',
      description: 'Learn 60 verbs',
      requirement: 'Learn 60 verbs to mastery',
      check: () => stats?.learnedVerbs >= 60
    },
    {
      id: '120_verbs',
      icon: '👑',
      name: '120 Verbs',
      description: 'Learn all 120 verbs',
      requirement: 'Learn all 120 verbs to mastery',
      check: () => stats?.learnedVerbs >= 120
    },
    {
      id: '30_day_challenge',
      icon: '🎯',
      name: '30 Day Challenge',
      description: 'Complete the full 30-day course',
      requirement: 'Complete all 30 days',
      check: () => stats?.daysCompleted >= 30
    }
  ];

  const earnedBadgeIds = achievements.map(a => a.badge);

  const getBadgeStatus = (badge) => {
    const earned = earnedBadgeIds.includes(badge.id);
    const unlocked = badge.check();
    
    if (earned) return 'earned';
    if (unlocked) return 'unlocked';
    return 'locked';
  };

  const getBadgeStyle = (status) => {
    if (status === 'earned') return 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-400';
    if (status === 'unlocked') return 'bg-green-50 border-green-300';
    return 'bg-gray-50 border-gray-200 opacity-50';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const earnedCount = achievements.length;
  const totalBadges = allBadges.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Achievements</h1>
        <p className="text-gray-600 mt-1">
          Earn badges as you progress through the course
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{earnedCount}</p>
          <p className="text-sm text-gray-500">Badges Earned</p>
        </div>
        <div className="card text-center">
          <Star className="w-8 h-8 text-primary-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{totalBadges}</p>
          <p className="text-sm text-gray-500">Total Badges</p>
        </div>
        <div className="card text-center">
          <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{Math.round((earnedCount / totalBadges) * 100)}%</p>
          <p className="text-sm text-gray-500">Completion</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Achievement Progress</span>
          <span className="text-sm font-medium text-primary-600">
            {earnedCount}/{totalBadges}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(earnedCount / totalBadges) * 100}%` }}
          />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allBadges.map((badge) => {
          const status = getBadgeStatus(badge);
          const isEarned = status === 'earned';
          const isUnlocked = status === 'unlocked';

          return (
            <div
              key={badge.id}
              className={`
                card transition-all duration-300
                ${getBadgeStyle(status)}
                ${isEarned ? 'transform hover:scale-105' : ''}
                ${isUnlocked ? 'hover:shadow-md' : ''}
              `}
            >
              <div className="flex items-start gap-4">
                <div className={`
                  w-14 h-14 rounded-full flex items-center justify-center text-3xl
                  ${isEarned ? 'bg-yellow-100' : isUnlocked ? 'bg-green-100' : 'bg-gray-100'}
                  ${isEarned ? 'animate-pulse-slow' : ''}
                `}>
                  {badge.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                    {isEarned && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                    {!isEarned && !isUnlocked && (
                      <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    {isUnlocked && !isEarned && (
                      <Award className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{badge.requirement}</p>
                  {isEarned && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Earned!
                    </p>
                  )}
                  {isUnlocked && !isEarned && (
                    <p className="text-xs text-primary-600 mt-1">
                      🎯 Unlocked - Claim your badge!
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivation */}
      {earnedCount < totalBadges && (
        <div className="card bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="text-4xl">🎯</div>
            <div>
              <p className="font-semibold text-gray-900">
                {totalBadges - earnedCount} badges remaining!
              </p>
              <p className="text-sm text-gray-600">
                Keep learning and unlock all achievements
              </p>
            </div>
            <div className="md:ml-auto text-sm text-primary-600 font-medium">
              {earnedCount}/{totalBadges} completed
            </div>
          </div>
        </div>
      )}

      {/* All Earned Message */}
      {earnedCount === totalBadges && (
        <div className="card bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 text-center">
          <div className="text-6xl mb-4">👑</div>
          <h2 className="text-2xl font-bold text-gray-900">All Badges Earned!</h2>
          <p className="text-gray-600 mt-2">
            You've completed every achievement. You're a true Verb Master!
          </p>
        </div>
      )}
    </div>
  );
};

export default Achievements;