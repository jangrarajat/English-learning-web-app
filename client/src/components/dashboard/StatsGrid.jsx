import React from 'react';
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  Flame,
  Target,
  CheckCircle,
  Clock,
  Sparkles,
  Calendar
} from 'lucide-react';

const StatsGrid = ({ stats, user, className = '' }) => {
  if (!stats) return null;

  const statItems = [
    {
      label: 'Current Day',
      value: `${user?.currentCourseDay || 1}/30`,
      subtext: 'Course progress',
      icon: Calendar,
      color: 'text-primary-600',
      bg: 'bg-primary-100'
    },
    {
      label: 'Day Streak',
      value: `🔥 ${stats.streak || user?.streak || 0}`,
      subtext: 'Keep it going!',
      icon: Flame,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    },
    {
      label: 'Verbs Learned',
      value: `${stats.learnedVerbs || 0}/120`,
      subtext: `${Math.round(((stats.learnedVerbs || 0) / 120) * 100)}% complete`,
      icon: BookOpen,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      label: 'Verbs Mastered',
      value: `${stats.masteredVerbs || 0}/120`,
      subtext: '⭐ Perfect score',
      icon: Award,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    },
    {
      label: 'Average Score',
      value: `${stats.averageScore || 0}%`,
      subtext: 'Across all tests',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      label: 'Days Completed',
      value: `${stats.daysCompleted || 0}/30`,
      subtext: 'Learning days',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100'
    },
    {
      label: 'Tests Taken',
      value: stats.testsCompleted || 0,
      subtext: 'Weekly & final tests',
      icon: Target,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      label: 'Total XP',
      value: user?.xp || 0,
      subtext: `Level ${user?.level || 1}`,
      icon: Sparkles,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100'
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {statItems.map((item, index) => (
        <div key={index} className="card hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500 truncate">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1 truncate">
                {item.value}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {item.subtext}
              </p>
            </div>
            <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0 ml-2`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;