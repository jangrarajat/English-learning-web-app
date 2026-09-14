import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  Target,
  BookOpen,
  Languages,
  FileText,
  PenTool,
  Sparkles,
  Lightbulb
} from 'lucide-react';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';

const DailyTasks = ({ verbs, onComplete, onBack }) => {
  const [currentTask, setCurrentTask] = useState(0);
  const [taskAnswers, setTaskAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);

  // ==================== Task Definitions ====================
  const tasks = [
    {
      id: 'recall_forms',
      title: 'Task 1: Recall Forms',
      description: 'Yaad karo V1 → V2 → V3',
      icon: Target,
      color: 'primary'
    },
    {
      id: 'meaning_test',
      title: 'Task 2: Meaning Test',
      description: 'English → Hindi meaning',
      icon: Languages,
      color: 'green'
    },
    {
      id: 'translation',
      title: 'Task 3: Translation',
      description: 'Hindi → English translation',
      icon: BookOpen,
      color: 'blue'
    },
    {
      id: 'fill_blank',
      title: 'Task 4: Fill in the Blank',
      description: 'Complete the sentence',
      icon: FileText,
      color: 'purple'
    },
    {
      id: 'sentence_builder',
      title: 'Task 5: Sentence Builder',
      description: 'Apna sentence banao',
      icon: PenTool,
      color: 'orange'
    }
  ];

  const currentTaskDef = tasks[currentTask];

  // ==================== Answer Handling ====================
  const handleAnswer = (key, value) => {
    setTaskAnswers(prev => ({
      ...prev,
      [currentTaskDef.id]: {
        ...prev[currentTaskDef.id],
        [key]: value
      }
    }));
  };

  const checkAnswer = (key, correctAnswer) => {
    const userAnswer = taskAnswers[currentTaskDef.id]?.[key]?.toLowerCase().trim();
    const correct = correctAnswer.toLowerCase().trim();
    return userAnswer === correct;
  };

  const handleSubmitTask = () => {
    setShowFeedback(true);
  };

  const handleNextTask = () => {
    if (currentTask < tasks.length - 1) {
      setCurrentTask(prev => prev + 1);
      setShowFeedback(false);
    } else {
      // Calculate final score
      const score = calculateScore();
      onComplete(taskAnswers, score);
    }
  };

  const handlePreviousTask = () => {
    if (currentTask > 0) {
      setCurrentTask(prev => prev - 1);
      setShowFeedback(false);
    }
  };

  // ==================== Score Calculation ====================
  const calculateScore = () => {
    let correct = 0;
    let total = 0;

    // Task 1: Recall Forms
    if (taskAnswers.recall_forms) {
      verbs.forEach(verb => {
        if (taskAnswers.recall_forms[`${verb._id}_v2`]) {
          total++;
          if (checkAnswer(`${verb._id}_v2`, verb.v2)) correct++;
        }
        if (taskAnswers.recall_forms[`${verb._id}_v3`]) {
          total++;
          if (checkAnswer(`${verb._id}_v3`, verb.v3)) correct++;
        }
      });
    }

    // Task 2: Meaning Test
    if (taskAnswers.meaning_test) {
      verbs.forEach(verb => {
        if (taskAnswers.meaning_test[verb._id]) {
          total++;
          if (checkAnswer(verb._id, verb.meaning)) correct++;
        }
      });
    }

    // Task 3: Translation
    if (taskAnswers.translation) {
      verbs.forEach(verb => {
        if (taskAnswers.translation[verb._id]) {
          total++;
          // Simple check - if user's answer contains the verb
          const userAnswer = taskAnswers.translation[verb._id]?.toLowerCase() || '';
          if (userAnswer.includes(verb.v2.toLowerCase()) || userAnswer.includes(verb.v1.toLowerCase())) {
            correct++;
          }
        }
      });
    }

    // Task 4: Fill in the Blank
    if (taskAnswers.fill_blank) {
      verbs.forEach(verb => {
        if (taskAnswers.fill_blank[verb._id]) {
          total++;
          if (checkAnswer(verb._id, verb.v2)) correct++;
        }
      });
    }

    // Task 5: Sentence Builder (all answers accepted)
    if (taskAnswers.sentence_builder) {
      verbs.forEach(verb => {
        if (taskAnswers.sentence_builder[verb._id]?.trim()) {
          total++;
          correct++; // Award full marks for attempting
        }
      });
    }

    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  // ==================== Progress ====================
  const getProgress = () => {
    return ((currentTask + 1) / tasks.length) * 100;
  };

  // ==================== Render Task Content ====================
  const renderTaskContent = () => {
    switch (currentTaskDef.id) {
      case 'recall_forms':
        return (
          <div className="space-y-4">
            {verbs.map((verb, idx) => (
              <div key={verb._id} className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900 mb-3">
                  {idx + 1}. {verb.v1}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">V2</label>
                    <input
                      type="text"
                      className="input-field mt-1"
                      placeholder="V2..."
                      value={taskAnswers.recall_forms?.[`${verb._id}_v2`] || ''}
                      onChange={(e) => handleAnswer(`${verb._id}_v2`, e.target.value)}
                    />
                    {showFeedback && taskAnswers.recall_forms?.[`${verb._id}_v2`] && (
                      <p className={`text-xs mt-1 ${checkAnswer(`${verb._id}_v2`, verb.v2) ? 'text-green-600' : 'text-red-600'}`}>
                        {checkAnswer(`${verb._id}_v2`, verb.v2) ? '✅' : `❌ ${verb.v2}`}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">V3</label>
                    <input
                      type="text"
                      className="input-field mt-1"
                      placeholder="V3..."
                      value={taskAnswers.recall_forms?.[`${verb._id}_v3`] || ''}
                      onChange={(e) => handleAnswer(`${verb._id}_v3`, e.target.value)}
                    />
                    {showFeedback && taskAnswers.recall_forms?.[`${verb._id}_v3`] && (
                      <p className={`text-xs mt-1 ${checkAnswer(`${verb._id}_v3`, verb.v3) ? 'text-green-600' : 'text-red-600'}`}>
                        {checkAnswer(`${verb._id}_v3`, verb.v3) ? '✅' : `❌ ${verb.v3}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'meaning_test':
        return (
          <div className="space-y-4">
            {verbs.map((verb, idx) => (
              <div key={verb._id} className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900 mb-2">
                  {idx + 1}. {verb.v1}
                </p>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Hindi meaning..."
                  value={taskAnswers.meaning_test?.[verb._id] || ''}
                  onChange={(e) => handleAnswer(verb._id, e.target.value)}
                />
                {showFeedback && taskAnswers.meaning_test?.[verb._id] && (
                  <p className={`text-xs mt-1 ${checkAnswer(verb._id, verb.meaning) ? 'text-green-600' : 'text-red-600'}`}>
                    {checkAnswer(verb._id, verb.meaning) ? '✅' : `❌ ${verb.meaning}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        );

      case 'translation':
        return (
          <div className="space-y-4">
            {verbs.map((verb, idx) => (
              <div key={verb._id} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Translate to English:
                </p>
                <p className="font-medium text-gray-900 mb-2">
                  Main kal {verb.meaning} karunga.
                </p>
                <input
                  type="text"
                  className="input-field"
                  placeholder="English translation..."
                  value={taskAnswers.translation?.[verb._id] || ''}
                  onChange={(e) => handleAnswer(verb._id, e.target.value)}
                />
                {showFeedback && taskAnswers.translation?.[verb._id] && (
                  <p className="text-xs mt-1 text-green-600">
                    ✅ Attempted! Sample: I will {verb.v1} tomorrow.
                  </p>
                )}
              </div>
            ))}
          </div>
        );

      case 'fill_blank':
        return (
          <div className="space-y-4">
            {verbs.map((verb, idx) => (
              <div key={verb._id} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Fill in the blank with the correct form:
                </p>
                <p className="font-medium text-gray-900 mb-2">
                  Yesterday I ____ to the market. ({verb.v1})
                </p>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Your answer..."
                  value={taskAnswers.fill_blank?.[verb._id] || ''}
                  onChange={(e) => handleAnswer(verb._id, e.target.value)}
                />
                {showFeedback && taskAnswers.fill_blank?.[verb._id] && (
                  <p className={`text-xs mt-1 ${checkAnswer(verb._id, verb.v2) ? 'text-green-600' : 'text-red-600'}`}>
                    {checkAnswer(verb._id, verb.v2) ? '✅' : `❌ Correct: ${verb.v2}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        );

      case 'sentence_builder':
        return (
          <div className="space-y-4">
            {verbs.map((verb, idx) => (
              <div key={verb._id} className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900 mb-2">
                  {idx + 1}. Create your own sentence using "{verb.v1}"
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  Meaning: {verb.meaning}
                </p>
                <textarea
                  className="input-field"
                  rows="2"
                  placeholder="Write your sentence here..."
                  value={taskAnswers.sentence_builder?.[verb._id] || ''}
                  onChange={(e) => handleAnswer(verb._id, e.target.value)}
                />
                {showFeedback && taskAnswers.sentence_builder?.[verb._id]?.trim() && (
                  <p className="text-xs mt-1 text-green-600">
                    ✅ Great! Keep practicing.
                  </p>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const TaskIcon = currentTaskDef.icon;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ==================== Header ==================== */}
      <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <TaskIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {currentTaskDef.title}
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              {currentTaskDef.description}
            </p>
          </div>
          <span className="text-sm font-medium text-gray-500">
            {currentTask + 1}/{tasks.length}
          </span>
        </div>
      </div>

      {/* ==================== Progress ==================== */}
      <ProgressBar value={getProgress()} showLabel={false} />

      {/* ==================== Task Tabs ==================== */}
      <div className="flex flex-wrap gap-2">
        {tasks.map((task, idx) => {
          const Icon = task.icon;
          const isActive = idx === currentTask;
          const isCompleted = idx < currentTask;

          return (
            <button
              key={task.id}
              onClick={() => {
                setCurrentTask(idx);
                setShowFeedback(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : isCompleted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              <span className="hidden sm:inline">Task {idx + 1}</span>
            </button>
          );
        })}
      </div>

      {/* ==================== Task Content ==================== */}
      <div className="card">
        {renderTaskContent()}
      </div>

      {/* ==================== Navigation ==================== */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={currentTask === 0 ? onBack : handlePreviousTask}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {currentTask === 0 ? 'Back to Recall' : 'Previous Task'}
        </Button>

        <div className="flex gap-2">
          {!showFeedback ? (
            <Button
              variant="primary"
              onClick={handleSubmitTask}
            >
              Check Answers
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleNextTask}
              className="flex items-center gap-2"
            >
              {currentTask === tasks.length - 1 ? (
                <>
                  Complete Day
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next Task
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ==================== Tip ==================== */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
        <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-yellow-800">Tip</p>
          <p className="text-yellow-700">
            Har task ko dhyaan se karo. Mistakes se hi seekhte hain! 💪
          </p>
        </div>
      </div>
    </div>
  );
};

export default DailyTasks;