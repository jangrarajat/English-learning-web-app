import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Target, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import Button from '../common/Button';

const TodayTasks = ({ 
  currentDay, 
  isTestDay, 
  dayCompleted, 
  verbsToday = 0,
  tasksCompleted = 0,
  totalTasks = 5,
  className = '' 
}) => {
  const progress = (tasksCompleted / totalTasks) * 100;

  const getTaskTitle = () => {
    if (isTestDay) return `📝 Test Day ${currentDay}`;
    if (dayCompleted) return `🎉 Day ${currentDay} Complete!`;
    return `📚 Today's Lesson - Day ${currentDay}`;
  };

  const getTaskDescription = () => {
    if (isTestDay) {
      const verbCount = currentDay === 7 ? 30 : currentDay === 14 ? 60 : currentDay === 21 ? 90 : 120;
      return `${verbCount} verb test - ${currentDay === 28 ? 'Complete course test' : 'Weekly test'}`;
    }
    if (dayCompleted) return 'Great job! Come back tomorrow for more.';
    return `Learn ${verbsToday || 5} new verbs and complete daily tasks`;
  };

  const getCTAButton = () => {
    if (dayCompleted) return null;
    if (isTestDay) {
      return (
        <Link to={`/test/${currentDay}`} className="btn-primary flex items-center gap-2">
          Start Test
          <ArrowRight className="w-4 h-4" />
        </Link>
      );
    }
    return (
      <Link to="/lesson" className="btn-primary flex items-center gap-2">
        Start Lesson
        <ArrowRight className="w-4 h-4" />
      </Link>
    );
  };

  const getTaskIcon = () => {
    if (isTestDay) return '📝';
    if (dayCompleted) return '✅';
    return '📖';
  };

  const getBackgroundClass = () => {
    if (isTestDay) return 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200';
    if (dayCompleted) return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200';
    return 'bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200';
  };

  return (
    <div className={`card ${getBackgroundClass()} ${className}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="text-4xl flex-shrink-0">{getTaskIcon()}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg">
              {getTaskTitle()}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {getTaskDescription()}
            </p>

            {/* Task progress */}
            {!isTestDay && !dayCompleted && verbsToday > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Today's Progress</span>
                  <span>{tasksCompleted}/{totalTasks} Tasks</span>
                </div>
                <div className="w-full bg-white/60 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Test day indicator */}
            {isTestDay && (
              <div className="flex items-center gap-2 mt-2 text-xs text-orange-700">
                <AlertCircle className="w-3 h-3" />
                <span>Don't skip! Test day is important.</span>
              </div>
            )}

            {/* Completed indicator */}
            {dayCompleted && (
              <div className="flex items-center gap-2 mt-2 text-xs text-green-700">
                <CheckCircle className="w-3 h-3" />
                <span>Great work today! See you tomorrow.</span>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 w-full md:w-auto">
          {getCTAButton()}
        </div>
      </div>

      {/* Quick tips */}
      {!dayCompleted && !isTestDay && (
        <div className="mt-4 pt-4 border-t border-white/50">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Sparkles className="w-3 h-3 text-yellow-500" />
            <span>Tip: Learn → Recall → Practice → Test → Review</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayTasks;