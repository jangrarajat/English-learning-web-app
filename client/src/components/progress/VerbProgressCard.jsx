import React from 'react';
import { 
  Star, 
  CheckCircle, 
  BookOpen, 
  Lock,
  TrendingUp,
  Clock
} from 'lucide-react';
import ProgressBar from '../common/ProgressBar';

const VerbProgressCard = ({ verb, progress, onClick, className = '' }) => {
  const getStatusIcon = () => {
    if (verb.isLocked) return <Lock className="w-5 h-5 text-gray-400" />;
    if (progress?.status === 'mastered') return <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
    if (progress?.status === 'learned') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (progress?.status === 'learning') return <BookOpen className="w-5 h-5 text-blue-500" />;
    return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
  };

  const getStatusText = () => {
    if (verb.isLocked) return 'Locked';
    if (progress?.status === 'mastered') return 'Mastered';
    if (progress?.status === 'learned') return 'Learned';
    if (progress?.status === 'learning') return 'Learning';
    return 'Not Started';
  };

  const getStatusColor = () => {
    if (verb.isLocked) return 'bg-gray-100 text-gray-500';
    if (progress?.status === 'mastered') return 'bg-yellow-100 text-yellow-700';
    if (progress?.status === 'learned') return 'bg-green-100 text-green-700';
    if (progress?.status === 'learning') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-500';
  };

  const getProgressColor = () => {
    const score = progress?.masteryScore || 0;
    if (score >= 90) return 'success';
    if (score >= 70) return 'primary';
    if (score >= 40) return 'warning';
    return 'danger';
  };

  return (
    <div 
      className={`card hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={() => onClick?.(verb)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">{verb.v1}</h3>
            <span className={`badge ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <div className="flex gap-3 text-sm text-gray-600 mt-1">
            <span>V2: {verb.v2}</span>
            <span>V3: {verb.v3}</span>
          </div>
          <p className="text-gray-600 text-sm mt-1">{verb.meaning}</p>
          <p className="text-xs text-gray-400 mt-0.5">Day {verb.day}</p>
        </div>
        <div className="flex flex-col items-end gap-1 ml-4">
          {getStatusIcon()}
          {progress && (
            <span className={`text-xs font-medium ${
              progress.masteryScore >= 90 ? 'text-green-600' :
              progress.masteryScore >= 70 ? 'text-blue-600' :
              progress.masteryScore >= 40 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {progress.masteryScore || 0}%
            </span>
          )}
        </div>
      </div>

      {progress && (
        <div className="mt-3 space-y-2">
          <ProgressBar 
            value={progress.masteryScore || 0} 
            color={getProgressColor()}
            size="sm"
          />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>✅ {progress.correctAnswers || 0}</span>
            <span>❌ {progress.wrongAnswers || 0}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {progress.timesSeen || 0} views
            </span>
          </div>

          {progress.nextReviewAt && (
            <div className="text-xs text-primary-600 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              Next review: {new Date(progress.nextReviewAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      {verb.isLocked && (
        <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Complete previous days to unlock
        </div>
      )}
    </div>
  );
};

export default VerbProgressCard;