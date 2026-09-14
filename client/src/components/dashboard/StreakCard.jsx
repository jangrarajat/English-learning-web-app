import React from 'react';
import { Flame, TrendingUp, Calendar, Award } from 'lucide-react';

const StreakCard = ({ streak = 0, lastActivityDate, className = '' }) => {
  const getStreakLevel = () => {
    if (streak >= 30) return { label: 'Legendary', color: 'text-purple-600', bg: 'bg-purple-100', emoji: '👑' };
    if (streak >= 21) return { label: 'Amazing', color: 'text-red-600', bg: 'bg-red-100', emoji: '🔥' };
    if (streak >= 14) return { label: 'Excellent', color: 'text-orange-600', bg: 'bg-orange-100', emoji: '⭐' };
    if (streak >= 7) return { label: 'Great', color: 'text-yellow-600', bg: 'bg-yellow-100', emoji: '✨' };
    if (streak >= 3) return { label: 'Good', color: 'text-green-600', bg: 'bg-green-100', emoji: '💪' };
    if (streak >= 1) return { label: 'Started', color: 'text-blue-600', bg: 'bg-blue-100', emoji: '🌱' };
    return { label: 'Start Today', color: 'text-gray-600', bg: 'bg-gray-100', emoji: '🎯' };
  };

  const level = getStreakLevel();

  const getMotivationMessage = () => {
    if (streak === 0) return 'Start your streak today! 🔥';
    if (streak === 1) return 'Great start! Come back tomorrow!';
    if (streak < 7) return `Only ${7 - streak} more days for a weekly streak!`;
    if (streak < 30) return `You're on fire! Keep it up!`;
    return 'Legendary! You are unstoppable! 👑';
  };

  const getDaysUntilNextMilestone = () => {
    const milestones = [7, 14, 21, 30];
    for (const milestone of milestones) {
      if (streak < milestone) return milestone - streak;
    }
    return 0;
  };

  const daysToMilestone = getDaysUntilNextMilestone();

  return (
    <div className={`card bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Current Streak</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-bold text-orange-600">{streak}</span>
            <span className="text-lg text-gray-600">
              {streak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-2 ${level.bg} ${level.color}`}>
            <span>{level.emoji}</span>
            <span>{level.label}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl">{level.emoji}</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-orange-200/50">
        <p className="text-sm text-gray-700">{getMotivationMessage()}</p>
        
        {daysToMilestone > 0 && streak > 0 && (
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
            <Award className="w-3 h-3" />
            <span>
              {daysToMilestone} {daysToMilestone === 1 ? 'day' : 'days'} to next milestone
            </span>
          </div>
        )}

        {lastActivityDate && (
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>
              Last active: {new Date(lastActivityDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Streak visual */}
      <div className="flex gap-1 mt-3">
        {[...Array(Math.min(streak, 7))].map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 bg-orange-500 rounded-full"
            title={`Day ${i + 1} of streak`}
          />
        ))}
        {streak < 7 && [...Array(7 - streak)].map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex-1 h-1.5 bg-orange-200 rounded-full"
          />
        ))}
      </div>
    </div>
  );
};

export default StreakCard;