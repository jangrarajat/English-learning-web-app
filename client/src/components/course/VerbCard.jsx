import React, { useState } from 'react';
import { 
  Volume2, 
  Lightbulb, 
  BookOpen, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';

const VerbCard = ({ verb, index, total, showRecall = false, onRecallComplete }) => {
  const [showExamples, setShowExamples] = useState(true);
  const [showHindi, setShowHindi] = useState(true);

  if (!verb) return null;

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="card animate-slide-up">
      {/* ==================== Header ==================== */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-gray-900">{verb.v1}</h2>
            <button
              onClick={() => handleSpeak(verb.v1)}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              title="Pronounce"
            >
              <Volume2 className="w-5 h-5 text-primary-600" />
            </button>
          </div>
          {verb.pronunciation && (
            <p className="text-sm text-gray-500 italic">/{verb.pronunciation}/</p>
          )}
        </div>
        {total && (
          <span className="badge badge-info">
            Verb {index + 1} of {total}
          </span>
        )}
      </div>

      {/* ==================== Verb Forms ==================== */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-primary-50 p-3 rounded-lg text-center border border-primary-100">
          <p className="text-xs text-primary-600 font-medium uppercase tracking-wide">V1 (Base)</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{verb.v1}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-100">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">V2 (Past)</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{verb.v2}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center border border-purple-100">
          <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">V3 (Past Participle)</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{verb.v3}</p>
        </div>
      </div>

      {/* ==================== Meaning ==================== */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg mb-4 border border-green-100">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-green-600" />
          <p className="text-xs text-green-700 font-medium uppercase tracking-wide">Meaning (Hindi)</p>
        </div>
        <p className="text-lg font-semibold text-green-800">{verb.meaning}</p>
      </div>

      {/* ==================== Examples Toggle ==================== */}
      <button
        onClick={() => setShowExamples(!showExamples)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors mb-3"
      >
        <BookOpen className="w-4 h-4" />
        Examples
        {showExamples ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* ==================== Examples ==================== */}
      {showExamples && (
        <div className="space-y-3 mb-4 animate-fade-in">
          {/* Present */}
          <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-green-700 uppercase tracking-wide">
                Present
              </p>
              <button
                onClick={() => handleSpeak(verb.examples?.present || '')}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                title="Speak"
              >
                <Volume2 className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-900 font-medium">
              {verb.examples?.present || `I ${verb.v1}.`}
            </p>
            {showHindi && verb.hindiTranslations?.present && (
              <p className="text-xs text-gray-600 mt-1">
                {verb.hindiTranslations.present}
              </p>
            )}
          </div>

          {/* Past */}
          <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                Past
              </p>
              <button
                onClick={() => handleSpeak(verb.examples?.past || '')}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                title="Speak"
              >
                <Volume2 className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-900 font-medium">
              {verb.examples?.past || `I ${verb.v2}.`}
            </p>
            {showHindi && verb.hindiTranslations?.past && (
              <p className="text-xs text-gray-600 mt-1">
                {verb.hindiTranslations.past}
              </p>
            )}
          </div>

          {/* Perfect */}
          <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                Perfect
              </p>
              <button
                onClick={() => handleSpeak(verb.examples?.perfect || '')}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                title="Speak"
              >
                <Volume2 className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-900 font-medium">
              {verb.examples?.perfect || `I have ${verb.v3}.`}
            </p>
            {showHindi && verb.hindiTranslations?.perfect && (
              <p className="text-xs text-gray-600 mt-1">
                {verb.hindiTranslations.perfect}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ==================== Tip ==================== */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
        <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-yellow-800">Yaad rakhne ka tarika</p>
          <p className="text-xs text-yellow-700 mt-0.5">
            {verb.v1} → {verb.v2} → {verb.v3} = "{verb.meaning}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerbCard;