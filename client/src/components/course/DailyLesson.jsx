import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronRight, 
  BookOpen, 
  Lightbulb,
  Sparkles,
  CheckCircle,
  Target,
  ArrowRight
} from 'lucide-react';
import { getDayVerbs, completeDay, getCurrentDay } from '../../api/course';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';
import VerbCard from './VerbCard';
import RecallExercise from './RecallExercise';
import DailyTasks from './DailyTasks';
import toast from 'react-hot-toast';

const DailyLesson = () => {
  const { day: paramDay } = useParams();
  const navigate = useNavigate();
  const [day, setDay] = useState(parseInt(paramDay) || null);
  const [verbs, setVerbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState('learn'); // learn, recall, tasks, complete
  const [currentVerbIndex, setCurrentVerbIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [recallAnswers, setRecallAnswers] = useState({});
  const [taskAnswers, setTaskAnswers] = useState({});

  // ==================== Data Fetching ====================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // If no day param, get current day
        let targetDay = day;
        if (!targetDay) {
          const { data } = await getCurrentDay();
          if (data.isTestDay) {
            navigate(`/test/${data.currentDay}`);
            return;
          }
          targetDay = data.currentDay;
          setDay(targetDay);
        }

        const { data } = await getDayVerbs(targetDay);
        setVerbs(data);
      } catch (error) {
        console.error('Error fetching lesson:', error);
        toast.error(error.response?.data?.message || 'Failed to load lesson');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [day, navigate]);

  // ==================== Step Handlers ====================
  const handleNextVerb = () => {
    if (currentVerbIndex < verbs.length - 1) {
      setCurrentVerbIndex(prev => prev + 1);
    } else {
      setCurrentStep('recall');
    }
  };

  const handlePreviousVerb = () => {
    if (currentVerbIndex > 0) {
      setCurrentVerbIndex(prev => prev - 1);
    }
  };

  const handleRecallComplete = (answers) => {
    setRecallAnswers(answers);
    setCurrentStep('tasks');
  };

  const handleTasksComplete = async (answers, taskScore) => {
    setTaskAnswers(answers);
    setScore(taskScore);

    try {
      await completeDay({
        day,
        score: taskScore,
        tasksCompleted: 5
      });
      setCompleted(true);
      setCurrentStep('complete');
      toast.success(`🎉 Day ${day} completed!`);
    } catch (error) {
      toast.error('Failed to complete day');
    }
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  // ==================== Loading & Error States ====================
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!verbs.length) {
    return (
      <div className="card text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Verbs Found</h3>
        <p className="text-gray-600 mb-4">This day doesn't have any verbs yet.</p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // ==================== Completion Screen ====================
  if (currentStep === 'complete' && completed) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Day {day} Complete!
        </h2>
        <p className="text-gray-600 mb-2">
          You learned {verbs.length} new verbs
        </p>
        <div className="text-5xl font-bold text-primary-600 mb-2">
          {score}%
        </div>
        <p className="text-gray-500 text-sm mb-6">
          Your score for today's lesson
        </p>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
          <div className="bg-primary-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-primary-700">{verbs.length}</p>
            <p className="text-xs text-gray-600">Verbs Learned</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-green-700">{score}%</p>
            <p className="text-xs text-gray-600">Score</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-orange-700">+50</p>
            <p className="text-xs text-gray-600">XP Earned</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={handleContinue}
            className="flex items-center gap-2 justify-center"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ==================== Main Lesson Flow ====================
  const stepProgress = {
    learn: 25,
    recall: 50,
    tasks: 75,
    complete: 100
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

      {/* ==================== Header ==================== */}
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
            <p className="text-sm text-gray-500">
              {currentStep === 'learn' && 'Learn New Verbs'}
              {currentStep === 'recall' && 'Active Recall'}
              {currentStep === 'tasks' && 'Daily Tasks'}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
          <span>Progress</span>
          <span className="font-medium">{stepProgress[currentStep]}%</span>
        </div>
      </div>

      {/* ==================== Step Progress Bar ==================== */}
      <div className="flex gap-2">
        <div className={`flex-1 h-1.5 rounded-full ${['learn', 'recall', 'tasks', 'complete'].includes(currentStep) ? 'bg-primary-600' : 'bg-gray-200'}`} />
        <div className={`flex-1 h-1.5 rounded-full ${['recall', 'tasks', 'complete'].includes(currentStep) ? 'bg-primary-600' : 'bg-gray-200'}`} />
        <div className={`flex-1 h-1.5 rounded-full ${['tasks', 'complete'].includes(currentStep) ? 'bg-primary-600' : 'bg-gray-200'}`} />
        <div className={`flex-1 h-1.5 rounded-full ${currentStep === 'complete' ? 'bg-primary-600' : 'bg-gray-200'}`} />
      </div>

      {/* ==================== Step 1: Learn ==================== */}
      {currentStep === 'learn' && (
        <>
          <VerbCard
            verb={verbs[currentVerbIndex]}
            index={currentVerbIndex}
            total={verbs.length}
          />

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={handlePreviousVerb}
              disabled={currentVerbIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="primary"
              onClick={handleNextVerb}
              className="flex items-center gap-2"
            >
              {currentVerbIndex === verbs.length - 1 ? (
                <>
                  Continue to Recall
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next Verb
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Verb dots indicator */}
          <div className="flex justify-center gap-2">
            {verbs.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentVerbIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentVerbIndex
                    ? 'bg-primary-600 w-6'
                    : idx < currentVerbIndex
                      ? 'bg-primary-400'
                      : 'bg-gray-300'
                }`}
                aria-label={`Go to verb ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* ==================== Step 2: Recall ==================== */}
      {currentStep === 'recall' && (
        <RecallExercise
          verbs={verbs}
          onComplete={handleRecallComplete}
          onBack={() => setCurrentStep('learn')}
        />
      )}

      {/* ==================== Step 3: Tasks ==================== */}
      {currentStep === 'tasks' && (
        <DailyTasks
          verbs={verbs}
          onComplete={handleTasksComplete}
          onBack={() => setCurrentStep('recall')}
        />
      )}
    </div>
  );
};

export default DailyLesson;