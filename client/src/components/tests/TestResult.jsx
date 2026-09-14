import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Award, TrendingUp, BookOpen, ArrowRight, Clock } from 'lucide-react';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';

const TestResult = ({ result, day, onRetry, onContinue }) => {
  const navigate = useNavigate();
  const passed = result?.score >= 70;

  if (!result) {
    return null;
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (score) => {
    if (score >= 90) return '🏆';
    if (score >= 70) return '🎉';
    if (score >= 50) return '💪';
    return '📚';
  };

  const getMessage = (score) => {
    if (score >= 90) return 'Excellent work! You\'re a verb master!';
    if (score >= 80) return 'Very good! Keep up the great work!';
    if (score >= 70) return 'Good job! You passed the test!';
    if (score >= 50) return 'Almost there! Review the weak verbs.';
    return 'Needs revision. Don\'t worry, practice makes perfect!';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Result Header */}
      <div className="card text-center">
        <div className="text-6xl mb-4">{getScoreEmoji(result.score)}</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {passed ? 'Test Passed! 🎉' : 'Needs Revision 📚'}
        </h2>
        <div className={`text-7xl font-bold ${getScoreColor(result.score)} mb-2`}>
          {result.score}%
        </div>
        <p className="text-gray-600 max-w-md mx-auto">
          {getMessage(result.score)}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center p-4">
          <div className="flex items-center justify-center mb-2">
            <Award className="w-6 h-6 text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{result.score}%</p>
          <p className="text-sm text-gray-500">Score</p>
        </div>
        <div className="card text-center p-4">
          <div className="flex items-center justify-center mb-2">
            <Check className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{result.correct}</p>
          <p className="text-sm text-gray-500">Correct</p>
        </div>
        <div className="card text-center p-4">
          <div className="flex items-center justify-center mb-2">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{result.wrong}</p>
          <p className="text-sm text-gray-500">Wrong</p>
        </div>
        <div className="card text-center p-4">
          <div className="flex items-center justify-center mb-2">
            <BookOpen className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{result.total}</p>
          <p className="text-sm text-gray-500">Total Questions</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Performance</span>
          <span className="text-sm font-medium text-primary-600">{result.score}%</span>
        </div>
        <ProgressBar 
          value={result.score} 
          color={result.score >= 70 ? 'success' : result.score >= 50 ? 'warning' : 'danger'}
        />
      </div>

      {/* Weak Verbs Section */}
      {result.weakVerbs && result.weakVerbs.length > 0 && (
        <div className="card border-red-200 bg-red-50">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-red-500" />
            Weak Verbs to Review
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.weakVerbs.map((verb, index) => (
              <span 
                key={index} 
                className="px-3 py-1.5 bg-white rounded-full text-sm border border-red-200 shadow-sm"
              >
                {verb}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Practice these verbs to improve your score.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        {!passed && (
          <Button
            variant="primary"
            onClick={onRetry}
            className="min-w-[150px]"
          >
            Retry Test
          </Button>
        )}
        {passed && (
          <Button
            variant="primary"
            onClick={() => {
              if (onContinue) {
                onContinue();
              } else {
                navigate('/dashboard');
              }
            }}
            className="min-w-[150px] flex items-center gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() => navigate('/dashboard')}
          className="min-w-[150px]"
        >
          Dashboard
        </Button>
      </div>

      {/* Tips */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            💡
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Tips for Improvement</h4>
            <ul className="text-sm text-gray-600 mt-1 space-y-1">
              {result.score < 70 && (
                <>
                  <li>• Review the weak verbs listed above</li>
                  <li>• Practice daily to reinforce learning</li>
                  <li>• Focus on V1 → V2 → V3 forms</li>
                </>
              )}
              {result.score >= 70 && result.score < 90 && (
                <>
                  <li>• Keep practicing to reach mastery</li>
                  <li>• Try to use verbs in sentences</li>
                </>
              )}
              {result.score >= 90 && (
                <li>• Excellent work! Challenge yourself with harder verbs</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResult;