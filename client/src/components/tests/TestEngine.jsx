import React, { useState, useEffect } from 'react';
import { Clock, Check, X, ArrowRight, ArrowLeft } from 'lucide-react';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';

const TestEngine = ({
  questions,
  onSubmit,
  onBack,
  timeLimit = null,
  showTimer = true,
  allowNavigation = true,
  className = ''
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [showReview, setShowReview] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!timeLimit || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, isSubmitted]);

  const handleAnswer = (questionIndex, optionIndex) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmit = () => {
    const answered = Object.keys(answers).length;
    if (answered < questions.length) {
      // Show warning but allow submission
      if (!confirm(`You have answered ${answered} out of ${questions.length} questions. Submit anyway?`)) {
        return;
      }
    }

    const correct = questions.filter((q, i) => {
      const answer = answers[i];
      return answer !== undefined && q.options[answer] === q.correctAnswer;
    });

    const score = Math.round((correct.length / questions.length) * 100);
    const wrongCount = questions.length - correct.length;

    const resultsData = {
      score,
      correct: correct.length,
      wrong: wrongCount,
      total: questions.length,
      details: questions.map((q, i) => ({
        ...q,
        userAnswer: answers[i] !== undefined ? q.options[answers[i]] : null,
        isCorrect: answers[i] !== undefined && q.options[answers[i]] === q.correctAnswer
      }))
    };

    setResults(resultsData);
    setIsSubmitted(true);
    
    if (onSubmit) {
      onSubmit(resultsData);
    }
  };

  const goToQuestion = (index) => {
    if (isSubmitted) return;
    setCurrentQuestion(Math.max(0, Math.min(index, questions.length - 1)));
  };

  const getQuestionStatus = (index) => {
    if (answers[index] !== undefined) return 'answered';
    return 'unanswered';
  };

  const formatTime = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (isSubmitted && results) {
    const passed = results.score >= 70;

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Results Summary */}
        <div className="card text-center">
          <div className={`text-6xl mb-4 ${passed ? 'text-green-500' : 'text-red-500'}`}>
            {passed ? '🏆' : '📚'}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {passed ? 'Test Passed!' : 'Needs Revision'}
          </h2>
          <div className="text-6xl font-bold text-primary-600 mb-2">
            {results.score}%
          </div>
          <p className="text-gray-600 mb-4">
            {results.correct} correct • {results.wrong} wrong • {results.total} total
          </p>

          {showTimer && timeLimit && (
            <div className="flex justify-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Time: {formatTime(timeLimit - (timeLeft || 0))}</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => setShowReview(!showReview)}
            >
              {showReview ? 'Hide Review' : 'Review Answers'}
            </Button>
            {onBack && (
              <Button
                variant="secondary"
                onClick={onBack}
              >
                Back
              </Button>
            )}
          </div>
        </div>

        {/* Answer Review */}
        {showReview && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-semibold text-gray-900">Answer Review</h3>
            {results.details.map((q, idx) => (
              <div key={idx} className="card bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${q.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {q.isCorrect ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Q{idx + 1}: {q.question}
                    </p>
                    <div className="mt-1 text-sm">
                      <p className="text-gray-600">
                        Your answer: <span className={q.isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {q.userAnswer || 'Not answered'}
                        </span>
                      </p>
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
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Test</h2>
          <p className="text-sm text-gray-500">{total} questions</p>
        </div>
        <div className="flex items-center gap-4">
          {showTimer && timeLimit && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
          )}
          <span className="text-sm text-gray-500">
            {Object.keys(answers).length}/{total} answered
          </span>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar
        value={currentQuestion + 1}
        max={total}
        label={`Question ${currentQuestion + 1} of ${total}`}
      />

      {/* Question */}
      <div className="card">
        <div className="text-sm text-gray-500 mb-2">
          {q.type?.replace(/_/g, ' ') || 'Question'}
        </div>
        <p className="text-lg font-medium text-gray-900 mb-6">{q.question}</p>
        <div className="space-y-3">
          {q.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(currentQuestion, index)}
              disabled={isSubmitted}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                ${answers[currentQuestion] === index
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500 ring-offset-2'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
                ${isSubmitted ? 'cursor-default' : 'cursor-pointer'}
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="secondary"
          onClick={() => goToQuestion(currentQuestion - 1)}
          disabled={currentQuestion === 0 || isSubmitted}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestion === total - 1 ? (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitted}
              className="flex items-center gap-2"
            >
              Submit Test
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => goToQuestion(currentQuestion + 1)}
              disabled={isSubmitted}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      {allowNavigation && !isSubmitted && (
        <div className="flex flex-wrap gap-1 justify-center">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToQuestion(idx)}
              className={`
                w-8 h-8 rounded-full text-xs font-medium transition-all
                ${idx === currentQuestion ? 'ring-2 ring-primary-500 bg-primary-100' : ''}
                ${answers[idx] !== undefined 
                  ? 'bg-primary-600 text-white hover:bg-primary-700' 
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }
                hover:scale-110 transform transition-transform
              `}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestEngine;