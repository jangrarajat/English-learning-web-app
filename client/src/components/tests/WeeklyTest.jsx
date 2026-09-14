import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Award, Clock, AlertCircle } from 'lucide-react';
import TestEngine from './TestEngine';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { getWeeklyTest, submitTest } from '../../api/tests';
import toast from 'react-hot-toast';

const WeeklyTest = ({ day, onComplete }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testInfo, setTestInfo] = useState(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const { data } = await getWeeklyTest(day);
        setQuestions(data.questions);
        setTestInfo({
          day: data.day,
          totalQuestions: data.totalQuestions,
          verbCount: data.verbCount || data.totalQuestions
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load test');
        toast.error('Failed to load test');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [day]);

  const handleSubmit = async (results) => {
    try {
      const { data } = await submitTest({
        day,
        answers: results.details.reduce((acc, q, i) => {
          const answerIndex = q.options.indexOf(q.userAnswer);
          if (answerIndex !== -1) {
            acc[i] = answerIndex;
          }
          return acc;
        }, {}),
        questions
      });

      toast.success('Test submitted successfully!');
      
      if (onComplete) {
        onComplete(data);
      }
      
      return data;
    } catch (err) {
      toast.error('Failed to submit test');
      throw err;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Test</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const getTestTitle = () => {
    if (day === 7) return 'Week 1 Test';
    if (day === 14) return 'Week 2 Test';
    if (day === 21) return 'Week 3 Test';
    if (day === 28) return 'Complete Test';
    return `Day ${day} Test`;
  };

  const getVerbCount = () => {
    if (day === 7) return '30';
    if (day === 14) return '60';
    if (day === 21) return '90';
    if (day === 28) return '120';
    return 'All';
  };

  return (
    <div className="space-y-6">
      {/* Test Header */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{getTestTitle()}</h2>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Day {day}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {testInfo?.totalQuestions || 0} questions
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {getVerbCount()} verbs
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Passing Score</p>
            <p className="text-xl font-bold text-primary-600">70%</p>
          </div>
        </div>
      </div>

      {/* Test Engine */}
      <TestEngine
        questions={questions}
        onSubmit={handleSubmit}
        onBack={() => navigate('/dashboard')}
        timeLimit={questions.length * 30} // 30 seconds per question
        showTimer={true}
        allowNavigation={true}
      />
    </div>
  );
};

export default WeeklyTest;