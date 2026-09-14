import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  X, 
  ChevronRight, 
  Lightbulb,
  BookOpen,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { getDayVerbs, completeDay } from '../api/course';
import { getCurrentDay } from '../api/course';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const DailyLesson = () => {
  const { day: paramDay } = useParams();
  const navigate = useNavigate();
  const [day, setDay] = useState(parseInt(paramDay) || 1);
  const [verbs, setVerbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recallAnswers, setRecallAnswers] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showRecall, setShowRecall] = useState(false);
  const [currentVerbIndex, setCurrentVerbIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current day if no param
        if (!paramDay) {
          const { data } = await getCurrentDay();
          if (data.isTestDay) {
            navigate(`/test/${data.currentDay}`);
            return;
          }
          setDay(data.currentDay);
        }
        
        const { data } = await getDayVerbs(day);
        setVerbs(data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load lesson');
        navigate('/dashboard');
      }
    };
    fetchData();
  }, [day, paramDay, navigate]);

  const handleRecallAnswer = (verbId, field, value) => {
    setRecallAnswers(prev => ({
      ...prev,
      [verbId]: { ...prev[verbId], [field]: value }
    }));
  };

  const handleQuizAnswer = (verbId, option) => {
    setQuizAnswers(prev => ({
      ...prev,
      [verbId]: option
    }));
  };

  const checkRecall = (verb, field) => {
    const userAnswer = recallAnswers[verb._id]?.[field]?.toLowerCase().trim();
    const correctAnswer = verb[field].toLowerCase().trim();
    return userAnswer === correctAnswer;
  };

  const calculateScore = () => {
    let correct = 0;
    let total = 0;

    verbs.forEach(verb => {
      // Check V2
      const v2Correct = checkRecall(verb, 'v2');
      if (recallAnswers[verb._id]?.v2) {
        total++;
        if (v2Correct) correct++;
      }

      // Check V3
      const v3Correct = checkRecall(verb, 'v3');
      if (recallAnswers[verb._id]?.v3) {
        total++;
        if (v3Correct) correct++;
      }

      // Check quiz
      if (quizAnswers[verb._id]) {
        total++;
        if (quizAnswers[verb._id] === verb.meaning) correct++;
      }
    });

    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  const handleComplete = async () => {
    const calculatedScore = calculateScore();
    setScore(calculatedScore);

    try {
      await completeDay({
        day,
        score: calculatedScore,
        tasksCompleted: 5
      });
      setCompleted(true);
      toast.success(`🎉 Day ${day} completed!`);
    } catch (error) {
      toast.error('Failed to complete day');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Day {day} Complete!</h2>
        <p className="text-gray-600 mb-2">
          You learned {verbs.length} new verbs
        </p>
        <div className="text-5xl font-bold text-primary-600 mb-2">{score}%</div>
        <p className="text-gray-500 text-sm mb-6">Your score for today's lesson</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/lesson')}
          >
            Continue Learning
          </Button>
        </div>
      </div>
    );
  }

  const currentVerb = verbs[currentVerbIndex] || verbs[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Day {day}</h1>
            <p className="text-sm text-gray-500">Learn 5 new verbs</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Progress</span>
          <span className="font-medium">{currentVerbIndex + 1}/{verbs.length}</span>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentVerbIndex + 1) / verbs.length) * 100}%` }}
        />
      </div>

      {/* Verb Card */}
      <div className="card animate-slide-up">
        <div className="space-y-6">
          {/* Verb Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{currentVerb.v1}</h2>
              <p className="text-sm text-gray-500">{currentVerb.pronunciation}</p>
            </div>
            <span className="badge badge-info">
              Verb {currentVerbIndex + 1} of {verbs.length}
            </span>
          </div>

          {/* Forms */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500">V1</p>
              <p className="text-lg font-semibold">{currentVerb.v1}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500">V2</p>
              <p className="text-lg font-semibold">{currentVerb.v2}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500">V3</p>
              <p className="text-lg font-semibold">{currentVerb.v3}</p>
            </div>
          </div>

          {/* Meaning */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Meaning</p>
            <p className="text-lg font-medium text-primary-700">{currentVerb.meaning}</p>
          </div>

          {/* Examples */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Examples</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Present</p>
                <p className="text-sm mt-1">{currentVerb.examples?.present}</p>
                <p className="text-xs text-gray-500 mt-1">{currentVerb.hindiTranslations?.present}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Past</p>
                <p className="text-sm mt-1">{currentVerb.examples?.past}</p>
                <p className="text-xs text-gray-500 mt-1">{currentVerb.hindiTranslations?.past}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Perfect</p>
                <p className="text-sm mt-1">{currentVerb.examples?.perfect}</p>
                <p className="text-xs text-gray-500 mt-1">{currentVerb.hindiTranslations?.perfect}</p>
              </div>
            </div>
          </div>

          {/* Recall Section */}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowRecall(!showRecall)}
              className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <Lightbulb className="w-4 h-4" />
              {showRecall ? 'Hide Practice' : 'Practice Active Recall'}
            </button>

            {showRecall && (
              <div className="mt-4 space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">V2 of "{currentVerb.v1}"</label>
                    <input
                      type="text"
                      className="input-field mt-1"
                      placeholder="Type V2..."
                      value={recallAnswers[currentVerb._id]?.v2 || ''}
                      onChange={(e) => handleRecallAnswer(currentVerb._id, 'v2', e.target.value)}
                    />
                    {recallAnswers[currentVerb._id]?.v2 && (
                      <p className={`text-xs mt-1 ${checkRecall(currentVerb, 'v2') ? 'text-green-600' : 'text-red-600'}`}>
                        {checkRecall(currentVerb, 'v2') ? '✅ Correct!' : `❌ Correct: ${currentVerb.v2}`}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">V3 of "{currentVerb.v1}"</label>
                    <input
                      type="text"
                      className="input-field mt-1"
                      placeholder="Type V3..."
                      value={recallAnswers[currentVerb._id]?.v3 || ''}
                      onChange={(e) => handleRecallAnswer(currentVerb._id, 'v3', e.target.value)}
                    />
                    {recallAnswers[currentVerb._id]?.v3 && (
                      <p className={`text-xs mt-1 ${checkRecall(currentVerb, 'v3') ? 'text-green-600' : 'text-red-600'}`}>
                        {checkRecall(currentVerb, 'v3') ? '✅ Correct!' : `❌ Correct: ${currentVerb.v3}`}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Meaning of "{currentVerb.v1}" in Hindi</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {[currentVerb.meaning, 'karna', 'jaana', 'aana'].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleQuizAnswer(currentVerb._id, option)}
                        className={`p-2 text-sm rounded-lg border-2 transition-colors ${
                          quizAnswers[currentVerb._id] === option
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {quizAnswers[currentVerb._id] && (
                    <p className={`text-xs mt-1 ${quizAnswers[currentVerb._id] === currentVerb.meaning ? 'text-green-600' : 'text-red-600'}`}>
                      {quizAnswers[currentVerb._id] === currentVerb.meaning 
                        ? '✅ Correct!' 
                        : `❌ Correct: ${currentVerb.meaning}`}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => setCurrentVerbIndex(prev => Math.max(0, prev - 1))}
          disabled={currentVerbIndex === 0}
        >
          Previous
        </Button>
        {currentVerbIndex === verbs.length - 1 ? (
          <Button
            variant="primary"
            onClick={handleComplete}
            className="flex items-center gap-2"
          >
            Complete Day {day}
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => setCurrentVerbIndex(prev => Math.min(verbs.length - 1, prev + 1))}
          >
            Next Verb
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default DailyLesson;