import React, { useState, useEffect } from 'react';
import { Calendar, Award, TrendingUp, ChevronRight, Clock } from 'lucide-react';
import { getTestHistory } from '../../api/tests';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';

const TestHistory = ({ limit = 10 }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTest, setExpandedTest] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const { data } = await getTestHistory();
        setTests(data.slice(0, limit));
      } catch (err) {
        setError('Failed to load test history');
        console.error('Error fetching test history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [limit]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="card text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button variant="secondary" className="mt-3" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="card text-center py-12">
        <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600">No Tests Yet</h3>
        <p className="text-gray-400 text-sm">Complete your first test to see history here</p>
      </div>
    );
  }

  const getTestType = (test) => {
    if (test.day === 28) return 'Complete Test';
    if (test.day === 7 || test.day === 14 || test.day === 21) return 'Weekly Test';
    return `Day ${test.day} Test`;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (score) => {
    if (score >= 90) return '🌟';
    if (score >= 70) return '✅';
    if (score >= 50) return '📖';
    return '📚';
  };

  return (
    <div className="space-y-4">
      {tests.map((test, index) => (
        <div key={index} className="card hover:shadow-md transition-shadow">
          <div 
            className="flex items-start justify-between cursor-pointer"
            onClick={() => setExpandedTest(expandedTest === index ? null : index)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getScoreEmoji(test.score)}</span>
                <h4 className="font-semibold text-gray-900">{getTestType(test)}</h4>
                <span className="badge badge-info text-xs">Day {test.day}</span>
              </div>
              <div className="flex flex-wrap gap-4 mt-1">
                <span className={`text-2xl font-bold ${getScoreColor(test.score)}`}>
                  {test.score}%
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  {test.correctAnswers}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <X className="w-4 h-4 text-red-500" />
                  {test.wrongAnswers}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(test.completedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedTest === index ? 'rotate-90' : ''}`} />
          </div>

          {/* Expanded Details */}
          {expandedTest === index && test.weakVerbs && test.weakVerbs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
              <p className="text-sm font-medium text-gray-700 mb-2">Weak Verbs:</p>
              <div className="flex flex-wrap gap-2">
                {test.weakVerbs.map((verb, idx) => (
                  <span key={idx} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm border border-red-200">
                    {verb}
                  </span>
                ))}
              </div>
            </div>
          )}

          {expandedTest === index && test.questions && (
            <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
              <details className="text-sm">
                <summary className="cursor-pointer text-primary-600 hover:text-primary-700">
                  View All Questions
                </summary>
                <div className="mt-2 space-y-2">
                  {test.questions.map((q, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className={q.isCorrect ? 'text-green-500' : 'text-red-500'}>
                          {q.isCorrect ? '✅' : '❌'}
                        </span>
                        <div>
                          <p className="text-sm text-gray-900">{q.question}</p>
                          <p className="text-xs text-gray-500">
                            Your answer: <span className={q.isCorrect ? 'text-green-600' : 'text-red-600'}>
                              {q.userAnswer || 'N/A'}
                            </span>
                            {!q.isCorrect && (
                              <span className="text-green-600"> (Correct: {q.correctAnswer})</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      ))}

      {/* View All Button */}
      {tests.length >= limit && (
        <div className="text-center">
          <Button
            variant="secondary"
            onClick={() => {/* Navigate to full history page */}}
          >
            View All Tests
          </Button>
        </div>
      )}
    </div>
  );
};

export default TestHistory;