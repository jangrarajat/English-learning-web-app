import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  Lock, 
  Target, 
  Award,
  ChevronRight,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProgressTimeline = ({ timeline, currentDay }) => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(null);

  const getDayStatus = (day) => {
    const info = timeline.find(d => d.day === day);
    if (!info) return 'locked';
    if (info.completed) return 'completed';
    if (info.isCurrent) return 'current';
    return 'locked';
  };

  const getDayIcon = (day) => {
    const status = getDayStatus(day);
    const info = timeline.find(d => d.day === day);
    
    if (status === 'completed') {
      return info?.isTestDay ? '🏆' : '✅';
    }
    if (status === 'current') {
      return info?.isTestDay ? '📝' : '🎯';
    }
    return '🔒';
  };

  const getDayColor = (day) => {
    const status = getDayStatus(day);
    if (status === 'completed') return 'border-green-500 bg-green-50';
    if (status === 'current') return 'border-primary-500 bg-primary-50 ring-2 ring-primary-500 ring-offset-2';
    return 'border-gray-200 bg-gray-50 opacity-60';
  };

  const getDayTextColor = (day) => {
    const status = getDayStatus(day);
    if (status === 'completed') return 'text-green-700';
    if (status === 'current') return 'text-primary-700';
    return 'text-gray-400';
  };

  const handleDayClick = (day) => {
    const status = getDayStatus(day);
    if (status === 'locked') return;
    
    const info = timeline.find(d => d.day === day);
    if (info?.isTestDay) {
      navigate(`/test/${day}`);
    } else if (status === 'completed') {
      navigate(`/lesson/${day}`);
    } else {
      navigate('/lesson');
    }
  };

  const getDayLabel = (day) => {
    const info = timeline.find(d => d.day === day);
    if (info?.isTestDay) return '📝 Test';
    return `Day ${day}`;
  };

  const getVerbCount = (day) => {
    const info = timeline.find(d => d.day === day);
    return info?.verbCount || 0;
  };

  const getScore = (day) => {
    const info = timeline.find(d => d.day === day);
    return info?.score || 0;
  };

  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < 30; i += 7) {
    const weekDays = [];
    for (let j = i; j < Math.min(i + 7, 30); j++) {
      weekDays.push(j + 1);
    }
    weeks.push(weekDays);
  }

  return (
    <div className="space-y-6">
      {/* Week by week timeline */}
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="card">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <h4 className="font-medium text-gray-700">Week {weekIndex + 1}</h4>
            <span className="text-xs text-gray-400 ml-auto">
              {week[0]} - {week[week.length - 1]}
            </span>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2">
            {week.map((day) => {
              const status = getDayStatus(day);
              const isSelected = selectedDay === day;
              const info = timeline.find(d => d.day === day);
              const isTestDay = info?.isTestDay || false;

              return (
                <button
                  key={day}
                  onClick={() => {
                    if (status !== 'locked') {
                      setSelectedDay(isSelected ? null : day);
                      handleDayClick(day);
                    }
                  }}
                  className={`
                    p-2 rounded-lg border-2 text-center transition-all duration-200
                    ${getDayColor(day)}
                    ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
                    ${status === 'locked' ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                  `}
                  disabled={status === 'locked'}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-lg">{getDayIcon(day)}</span>
                    <span className={`text-xs font-medium ${getDayTextColor(day)}`}>
                      {day}
                    </span>
                    {isTestDay && (
                      <span className="text-[8px] text-primary-600 font-bold bg-primary-100 px-1 rounded">
                        TEST
                      </span>
                    )}
                    {status === 'completed' && getScore(day) > 0 && (
                      <span className={`text-[10px] font-medium ${getScore(day) >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {getScore(day)}%
                      </span>
                    )}
                    {status === 'current' && (
                      <span className="text-[10px] text-primary-600 font-medium animate-pulse">
                        Current
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="card animate-fade-in bg-primary-50 border-primary-200">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                Day {selectedDay}
                {timeline.find(d => d.day === selectedDay)?.isTestDay && ' 📝 Test'}
              </h4>
              <p className="text-sm text-gray-600">
                {getDayStatus(selectedDay) === 'completed' ? '✅ Completed' : 
                 getDayStatus(selectedDay) === 'current' ? '🔄 In Progress' : 
                 '🔒 Locked'}
              </p>
              {getVerbCount(selectedDay) > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {getVerbCount(selectedDay)} verbs
                </p>
              )}
              {getScore(selectedDay) > 0 && (
                <p className="text-sm font-medium text-primary-600 mt-1">
                  Score: {getScore(selectedDay)}%
                </p>
              )}
            </div>
            {getDayStatus(selectedDay) !== 'locked' && (
              <button
                onClick={() => {
                  const info = timeline.find(d => d.day === selectedDay);
                  if (info?.isTestDay) {
                    navigate(`/test/${selectedDay}`);
                  } else {
                    navigate(`/lesson/${selectedDay}`);
                  }
                }}
                className="btn-primary text-sm flex items-center gap-1"
              >
                View
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-600">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-500" />
          <span className="text-gray-600">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          <span className="text-gray-600">Locked</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <span className="text-gray-600">Test Day</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressTimeline;