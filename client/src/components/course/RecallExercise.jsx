import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  Lightbulb,
  Brain,
  Sparkles
} from 'lucide-react';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';

const RecallExercise = ({ verbs, onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionType, setQuestionType] = useState('v2');

  const currentVerb = verbs[currentIndex];
  const totalQuestions = verbs.length * 2; // V2 and V3 for each verb

  // ==================== Question Types ====================
  const questionTypes = [
    { id: 'v2', label: 'V2 (Past)', field: 'v2', placeholder: 'Type past form...' },
    { id: 'v3', label: 'V3 (Past Participle)', field: 'v3', placeholder: 'Type past participle...' }
  ];

  // ==================== Navigation ====================
  const handleNext = () => {
    if (currentIndex < verbs.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowFeedback(false);
    } else if (questionType === 'v2') {
      // Move to V3 questions
      setQuestionType('v3');
      setCurrentIndex(0);
      setShowFeedback(false);
    } else {
      // Complete recall
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowFeedback(false);
    } else if (questionType === 'v3') {
      setQuestionType('v2');
      setCurrentIndex(verbs.length - 1);
      setShowFeedback(false);
    }
  };

  // ==================== Answer Handling ====================
  const handleAnswerChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentVerb._id]: {
        ...prev[currentVerb._id],
        [questionType]: value
      }
    }));
  };

  const checkAnswer = () => {
    const userAnswer = answers[currentVerb._id]?.[questionType]?.toLowerCase().trim();
    const correctAnswer = currentVerb[questionType]?.toLowerCase().trim();
    setShowFeedback(true);
    return userAnswer === correctAnswer;
  };

  const isCorrect = () => {
    const userAnswer = answers[currentVerb._id]?.[questionType]?.toLowerCase().trim();
    const correctAnswer = currentVerb[questionType]?.toLowerCase().trim();
    return userAnswer === correctAnswer;
  };

  // ==================== Progress Calculation ====================
  const getProgress = () => {
    const answeredCount = Object.values(answers).reduce((acc, val) => {
      return acc + (val.v2 ? 1 : 0) + (val.v3 ? 1 : 0);
    }, 0);
    return (answeredCount / totalQuestions) * 100;
  };

  const getCurrentQuestionNumber = () => {
    if (questionType === 'v2') return currentIndex + 1;
    return verbs.length + currentIndex + 1;
  };

  if (!currentVerb) return null;

  const currentField = questionTypes.find(q => q.id === questionType);
  const userAnswer = answers[currentVerb._id]?.[questionType] || '';
  const correct = showFeedback && isCorrect();

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ==================== Header ==================== */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              Ab dekhte hain kitna yaad raha
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Active recall se apni memory test karo
            </p>
          </div>
        </div>
      </div>

      {/* ==================== Progress ==================== */}
      <div>
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>
            Question {getCurrentQuestionNumber()} of {totalQuestions}
          </span>
          <span>{Math.round(getProgress())}% complete</span>
        </div>
        <ProgressBar value={getProgress()} showLabel={false} />
      </div>

      {/* ==================== Question Type Tabs ==================== */}
      <div className="flex gap-2">
        {questionTypes.map(type => (
          <button
            key={type.id}
            onClick={() => {
              setQuestionType(type.id);
              setShowFeedback(false);
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              questionType === type.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* ==================== Question Card ==================== */}
      <div className="card">
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 mb-2">
            {currentField.label} of
          </p>
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            {currentVerb.v1}
          </h3>

          {/* Input */}
          <div className="max-w-md mx-auto">
            <input
              type="text"
              className={`input-field text-center text-lg ${
                showFeedback
                  ? correct
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : ''
              }`}
              placeholder={currentField.placeholder}
              value={userAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              disabled={showFeedback}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (!showFeedback) {
                    checkAnswer();
                  } else {
                    handleNext();
                  }
                }
              }}
            />

            {/* Feedback */}
            {showFeedback && (
              <div className={`mt-4 p-3 rounded-lg ${
                correct
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  {correct ? (
                    <>
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-700">
                        Sahi jawab! 🎉
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-700">
                        Galat jawab
                      </span>
                    </>
                  )}
                </div>
                {!correct && (
                  <p className="text-sm text-gray-700 text-center">
                    Correct answer:{' '}
                    <span className="font-bold text-green-700">
                      {currentVerb[questionType]}
                    </span>
                  </p>
                )}
                <p className="text-xs text-gray-600 text-center mt-1">
                  {currentVerb.v1} → {currentVerb.v2} → {currentVerb.v3}
                </p>
              </div>
            )}

            {/* Check Button */}
            {!showFeedback && (
              <Button
                variant="primary"
                onClick={checkAnswer}
                disabled={!userAnswer.trim()}
                className="mt-4 w-full"
              >
                Check Answer
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ==================== Verb Hint ==================== */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
        <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-yellow-800">Hint</p>
          <p className="text-yellow-700">
            Meaning: <span className="font-medium">{currentVerb.meaning}</span>
          </p>
        </div>
      </div>

      {/* ==================== Navigation ==================== */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Learning
        </Button>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentIndex === 0 && questionType === 'v2'}
          >
            Previous
          </Button>
          {showFeedback && (
            <Button
              variant="primary"
              onClick={handleNext}
            >
              {currentIndex === verbs.length - 1 && questionType === 'v3' ? (
                <>
                  Continue to Tasks
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ==================== Question Dots ==================== */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {verbs.map((verb, idx) => {
          const v2Answered = answers[verb._id]?.v2;
          const v3Answered = answers[verb._id]?.v3;
          const isCurrentV2 = questionType === 'v2' && idx === currentIndex;
          const isCurrentV3 = questionType === 'v3' && idx === currentIndex;

          return (
            <div key={verb._id} className="flex gap-1">
              <button
                onClick={() => {
                  setQuestionType('v2');
                  setCurrentIndex(idx);
                  setShowFeedback(false);
                }}
                className={`w-6 h-6 rounded-full text-xs font-medium transition-all ${
                  isCurrentV2
                    ? 'ring-2 ring-primary-500 bg-primary-100'
                    : v2Answered
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
                title={`${verb.v1} - V2`}
              >
                {idx + 1}
              </button>
              <button
                onClick={() => {
                  setQuestionType('v3');
                  setCurrentIndex(idx);
                  setShowFeedback(false);
                }}
                className={`w-6 h-6 rounded-full text-xs font-medium transition-all ${
                  isCurrentV3
                    ? 'ring-2 ring-primary-500 bg-purple-100'
                    : v3Answered
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
                title={`${verb.v1} - V3`}
              >
                {idx + 1}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecallExercise;