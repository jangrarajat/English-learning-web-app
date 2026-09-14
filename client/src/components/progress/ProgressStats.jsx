import React from 'react';
import { 
  TrendingUp, 
  BookOpen, 
  Award, 
  Clock,
  Target,
  Sparkles,
  Calendar,
  Star
} from 'lucide-react';

const ProgressStats = ({ stats, className = '' }) => {
  if (!stats) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: 'Days Completed',
      value: `${stats.daysCompleted || 0}/30`,
      icon: Calendar,
      color: 'text-primary-600',
      bg: 'bg-primary-100'
    },
    {
      label: 'Verbs Mastered',
      value: `${stats.masteredVerbs || 0}/120`,
      icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    },
    {
      label: 'Avg Score',
      value: `${stats.averageScore || 0}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      label: 'Current Streak',
      value: `🔥 ${stats.streak || 0}`,
      icon: Sparkles,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {statItems.map((item, index) => (
        <div key={index} className="card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
            </div>
            <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressStats;