import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  Target, 
  ArrowRight,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import ProgressBar from '../common/ProgressBar';

const ProgressCard = ({ 
  currentDay = 0, 
  totalDays = 30, 
  verbsLearned = 0,
  totalVerbs = 120,
  masteredVerbs = 0,
  averageScore = 0,
  className = '' 
}) => {
  const dayProgress = (currentDay / totalDays) * 100;
  const verbProgress = (verbsLearned / totalVerbs) * 100;
  const masteryProgress = (masteredVerbs / totalVerbs) * 100;

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-500" />
          Course Progress
        </h3>
        <span className="text-sm font-medium text-primary-600">
          Day {currentDay} of {totalDays}
        </span>
      </div>

      {/* Main progress */}
      <div className="space-y-4">
        {/* Day Progress */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Day Progress</span>
            <span className="text-sm font-medium text-gray-900">
              {currentDay}/{totalDays}
            </span>
          </div>
          <ProgressBar 
            value={currentDay} 
            max={totalDays} 
            showLabel={false}
            color="primary"
          />
        </div>

        {/* Verbs Learned */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Verbs Learned</span>
            <span className="text-sm font-medium text-green-600">
              {verbsLearned}/{totalVerbs}
            </span>
          </div>
          <ProgressBar 
            value={verbsLearned} 
            max={totalVerbs} 
            showLabel={false}
            color="success"
          />
        </div>

        {/* Verbs Mastered */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Verbs Mastered</span>
            <span className="text-sm font-medium text-yellow-600">
              {masteredVerbs}/{totalVerbs}
            </span>
          </div>
          <ProgressBar 
            value={masteredVerbs} 
            max={totalVerbs} 
            showLabel={false}
            color="warning"
          />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Avg Score</p>
            <p className="font-semibold text-gray-900">{averageScore}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Completion</p>
            <p className="font-semibold text-gray-900">{Math.round(dayProgress)}%</p>
          </div>
        </div>
      </div>

      {/* Link to progress page */}
      <Link 
        to="/progress"
        className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
      >
        View Detailed Progress
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default ProgressCard;