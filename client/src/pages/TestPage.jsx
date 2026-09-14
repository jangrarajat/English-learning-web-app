import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, X, ArrowRight, Clock } from 'lucide-react';
import { getWeeklyTest, submitTest } from '../api/tests';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const TestPage = () => {
  const { day } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const { data } = await getWeeklyTest(day);
        setQuestions(data.questions);
        setTimeLeft(data.totalQuestions * 30); // 30 seconds per question
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load test');
        navigate('/dashboard');
      }
    };
    fetchTest();
  }, [day, navigate]);

  useEffect(() => {
    if (timeLeft === null || testCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, testCompleted]);

  const handleAnswer = (questionIndex, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    const answered = Object.keys(answers).length;
    if (answered < questions.length) {
      toast.error(`Please answer all ${questions.length} questions`);
      return;
    }

    const correct = questions.filter((q, i) => {
      const answer = answers[i];
      return answer !== undefined && q.options[answer] === q.correctAnswer;
    });

    const score = Math.round((correct.length / questions.length) * 100);

    try {
      const { data } = await submitTest({
        day: parseInt(day),
        answers,
        questions
      });
      setResult({ ...data, score });
      setTestCompleted(true);
      toast.success('Test submitted!');
    } catch (error) {
      toast.error('Failed to submit test');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (testCompleted && result) {
    const passed = result.score >= 70;
    const weakVerbs = result.weakVerbs || [];

    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card text-center">
          <div className={`text-6xl mb-4 ${passed ? 'text-green-500' : 'text-red-500'}`}>
            {passed ? '🏆' : '📚'}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {passed ? 'Test Passed!' : 'Needs Revision'}
          </h2>
          <p className="text-6xl font-bold text-primary-600 mb-2">{result.score}%</p>
          <p className="text-gray-600 mb-4">
            {result.correctAnswers} correct • {result.wrongAnswers} wrong
          </p>

          <div className="flex justify-center gap-4 text-sm mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Completed in {Math.floor((timeLeft || 0) / 60)}m</span>
            </div>
          </div>

          {!passed && weakVerbs.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="font-medium text-red-700 mb-2">Weak Verbs to Revise:</p>
              <div className="flex flex-wrap gap-2">
                {weakVerbs.map((v, i) => (
                  <span key={i} className="px-3 py-1 bg-white rounded-full text-sm border border-red-200">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {passed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-green-700">🎉 Excellent work! Keep up the momentum!</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
            {!passed && (
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
              >
                Retry Test
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => setShowReview(!showReview)}
            >
              {showReview ? 'Hide Review' : 'Review Answers'}
            </Button>
          </div>
        </div>

        {/* Review Answers */}
        {showReview && (
          <div className="mt-6 space-y-4 animate-fade-in">
            <h3 className="font-semibold text-gray-900">Answer Review</h3>
            {result.questions?.map((q, idx) => (
              <div key={idx} className="card bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${q.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {q.isCorrect ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{q.question}</p>
                    <div className="mt-1 text-sm">
                      <p className="text-gray-600">Your answer: <span className={q.isCorrect ? 'text-green-600' : 'text-red-600'}>
                        {q.userAnswer || 'Not answered'}
                      </span></p>
                      {!q.isCorrect && (
                        <p className="text-green-600">Correct: {q.correctAnswer}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const q = questions[currentQuestion];
  const total = questions.length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Day {day}</h1>
          <p className="text-sm text-gray-500">{total} questions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="font-mono">
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {Object.keys(answers).length}/{total} answered
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Question {currentQuestion + 1} of {total}</span>
          <span>{Math.round((currentQuestion + 1) / total * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentQuestion + 1) / total * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="card mb-6">
        <div className="text-sm text-gray-500 mb-2">
          {q.type?.replace('_', ' ') || 'Question'}
        </div>
        <p className="text-lg font-medium text-gray-900 mb-6">{q.question}</p>
        <div className="space-y-3">
          {q.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(currentQuestion, index)}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                ${answers[currentQuestion] === index
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500 ring-offset-2'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        <div className="flex gap-2">
          {currentQuestion === total - 1 ? (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < total}
              className="flex items-center gap-2"
            >
              Submit Test
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => setCurrentQuestion(prev => Math.min(total - 1, prev + 1))}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Question Progress */}
      <div className="flex flex-wrap gap-1 mt-6 justify-center">
        {questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentQuestion(idx)}
            className={`
              w-8 h-8 rounded-full text-xs font-medium transition-all
              ${idx === currentQuestion ? 'ring-2 ring-primary-500 bg-primary-100' : ''}
              ${answers[idx] !== undefined ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}
              hover:bg-primary-500 hover:text-white
            `}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TestPage;