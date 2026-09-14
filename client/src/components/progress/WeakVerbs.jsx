import React, { useState } from 'react';
import { 
  AlertCircle, 
  BookOpen, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';

const WeakVerbs = ({ weakVerbs, onPractice, className = '' }) => {
  const [expandedVerb, setExpandedVerb] = useState(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState({});

  if (!weakVerbs || weakVerbs.length === 0) {
    return (
      <div className={`card text-center py-8 ${className}`}>
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900">No Weak Verbs!</h3>
        <p className="text-gray-600">Great job! All your verbs are strong. Keep up the good work! 🎉</p>
      </div>
    );
  }

  const getMasteryColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMasteryLabel = (score) => {
    if (score >= 70) return 'Good';
    if (score >= 40) return 'Learning';
    return 'Weak';
  };

  const startPractice = () => {
    setPracticeMode(true);
    setPracticeIndex(0);
    setPracticeAnswers({});
  };

  const handlePracticeAnswer = (verbId, field, value) => {
    setPracticeAnswers(prev => ({
      ...prev,
      [verbId]: { ...prev[verbId], [field]: value }
    }));
  };

  const checkPracticeAnswer = (verb, field) => {
    const answer = practiceAnswers[verb.verbId]?.[field]?.toLowerCase().trim();
    const correct = verb[field]?.toLowerCase().trim();
    return answer === correct;
  };

  const getPracticeProgress = () => {
    const total = weakVerbs.length * 2; // V2 and V3
    const answered = Object.values(practiceAnswers).reduce((acc, val) => {
      return acc + Object.keys(val).filter(k => val[k]).length;
    }, 0);
    return Math.round((answered / total) * 100);
  };

  if (practiceMode) {
    const currentVerb = weakVerbs[practiceIndex];

    return (
      <div className={`card ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary-500" />
            Practice Weak Verbs
          </h3>
          <span className="text-sm text-gray-500">
            {practiceIndex + 1} of {weakVerbs.length}
          </span>
        </div>

        <ProgressBar 
          value={getPracticeProgress()} 
          label="Practice Progress"
        />

        {currentVerb && (
          <div className="mt-4 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-lg text-gray-900">{currentVerb.verbName}</h4>
              <p className="text-sm text-gray-600">Meaning: {currentVerb.meaning}</p>
              <p className={`text-sm font-medium ${getMasteryColor(currentVerb.masteryScore)}`}>
                Mastery: {currentVerb.masteryScore}% ({getMasteryLabel(currentVerb.masteryScore)})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">V2 of "{currentVerb.verbName}"</label>
                <input
                  type="text"
                  className="input-field mt-1"
                  placeholder="Type V2..."
                  value={practiceAnswers[currentVerb.verbId]?.v2 || ''}
                  onChange={(e) => handlePracticeAnswer(currentVerb.verbId, 'v2', e.target.value)}
                />
                {practiceAnswers[currentVerb.verbId]?.v2 && (
                  <p className={`text-xs mt-1 ${checkPracticeAnswer(currentVerb, 'v2') ? 'text-green-600' : 'text-red-600'}`}>
                    {checkPracticeAnswer(currentVerb, 'v2') ? '✅ Correct!' : `❌ Correct: ${currentVerb.v2}`}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500">V3 of "{currentVerb.verbName}"</label>
                <input
                  type="text"
                  className="input-field mt-1"
                  placeholder="Type V3..."
                  value={practiceAnswers[currentVerb.verbId]?.v3 || ''}
                  onChange={(e) => handlePracticeAnswer(currentVerb.verbId, 'v3', e.target.value)}
                />
                {practiceAnswers[currentVerb.verbId]?.v3 && (
                  <p className={`text-xs mt-1 ${checkPracticeAnswer(currentVerb, 'v3') ? 'text-green-600' : 'text-red-600'}`}>
                    {checkPracticeAnswer(currentVerb, 'v3') ? '✅ Correct!' : `❌ Correct: ${currentVerb.v3}`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={() => setPracticeIndex(prev => Math.max(0, prev - 1))}
                disabled={practiceIndex === 0}
              >
                Previous
              </Button>
              {practiceIndex === weakVerbs.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    setPracticeMode(false);
                    if (onPractice) onPractice(practiceAnswers);
                  }}
                >
                  Complete Practice
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setPracticeIndex(prev => Math.min(weakVerbs.length - 1, prev + 1))}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-900">
            Weak Verbs ({weakVerbs.length})
          </h3>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={startPractice}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Practice Now
        </Button>
      </div>

      <div className="space-y-3">
        {weakVerbs.map((verb) => {
          const isExpanded = expandedVerb === verb.verbId;

          return (
            <div key={verb.verbId} className="card p-4 hover:shadow-md transition-shadow">
              <div 
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpandedVerb(isExpanded ? null : verb.verbId)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{verb.verbName}</h4>
                    <span className={`text-xs font-medium ${getMasteryColor(verb.masteryScore)}`}>
                      {verb.masteryScore}%
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                    <span>V2: {verb.v2}</span>
                    <span>V3: {verb.v3}</span>
                    <span>Meaning: {verb.meaning}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    ❌ {verb.wrongAnswers || 0}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-red-50 p-2 rounded">
                      <p className="text-xs text-gray-500">Weak Area</p>
                      <p className="font-medium text-red-600">
                        {verb.wrongAnswers > 3 ? 'Needs significant practice' : 'Needs review'}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-xs text-gray-500">Recommended Action</p>
                      <p className="font-medium text-blue-600">
                        {verb.masteryScore < 30 ? 'Start from basics' : 'Practice forms'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      startPractice();
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Practice This Verb
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeakVerbs;