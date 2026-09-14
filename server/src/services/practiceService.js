import { shuffleArray } from './testService.js';

// ==================== Practice Question Types ====================
const PRACTICE_TYPES = ['V2', 'V3', 'MEANING', 'TRANSLATION'];

// ==================== @desc    Generate practice questions ====================
export const generatePracticeQuestions = (verbs, count) => {
  if (!verbs || !verbs.length) return [];

  const questions = [];
  const shuffledVerbs = shuffleArray([...verbs]);
  const totalQuestions = Math.min(count, shuffledVerbs.length * 2);

  for (let i = 0; i < totalQuestions; i++) {
    const verb = shuffledVerbs[i % shuffledVerbs.length];
    const type = PRACTICE_TYPES[i % PRACTICE_TYPES.length];

    const question = generatePracticeQuestion(verb, type, verbs);
    if (question) {
      questions.push(question);
    }
  }

  return shuffleArray(questions);
};

// ==================== @desc    Generate single practice question ====================
const generatePracticeQuestion = (verb, type, allVerbs = []) => {
  try {
    switch (type) {
      case 'V2':
        return generateV2Question(verb, allVerbs);
      case 'V3':
        return generateV3Question(verb, allVerbs);
      case 'MEANING':
        return generateMeaningQuestion(verb, allVerbs);
      case 'TRANSLATION':
        return generateTranslationQuestion(verb);
      default:
        return generateV2Question(verb, allVerbs);
    }
  } catch (error) {
    console.error('generatePracticeQuestion error:', error);
    return null;
  }
};

// ==================== Question Generators ====================

const generateV2Question = (verb, allVerbs) => {
  const wrongs = allVerbs
    .filter(v => v._id.toString() !== verb._id.toString())
    .slice(0, 3)
    .map(v => v.v2);

  // Ensure we have 3 wrong options
  while (wrongs.length < 3) {
    wrongs.push('went');
  }

  const options = shuffleArray([verb.v2, ...wrongs]);

  return {
    verbId: verb._id,
    verbName: verb.v1,
    type: 'V2',
    question: `What is the V2 of "${verb.v1}"?`,
    options,
    correctAnswer: verb.v2
  };
};

const generateV3Question = (verb, allVerbs) => {
  const wrongs = allVerbs
    .filter(v => v._id.toString() !== verb._id.toString())
    .slice(0, 3)
    .map(v => v.v3);

  while (wrongs.length < 3) {
    wrongs.push('gone');
  }

  const options = shuffleArray([verb.v3, ...wrongs]);

  return {
    verbId: verb._id,
    verbName: verb.v1,
    type: 'V3',
    question: `What is the V3 of "${verb.v1}"?`,
    options,
    correctAnswer: verb.v3
  };
};

const generateMeaningQuestion = (verb, allVerbs) => {
  const wrongs = allVerbs
    .filter(v => v._id.toString() !== verb._id.toString())
    .slice(0, 3)
    .map(v => v.meaning);

  while (wrongs.length < 3) {
    wrongs.push('karna');
  }

  const options = shuffleArray([verb.meaning, ...wrongs]);

  return {
    verbId: verb._id,
    verbName: verb.v1,
    type: 'MEANING',
    question: `What does "${verb.v1}" mean in Hindi?`,
    options,
    correctAnswer: verb.meaning
  };
};

const generateTranslationQuestion = (verb) => {
  const hindiText = verb.hindiTranslations?.past || `Main ${verb.meaning} karta tha.`;
  const correct = verb.examples?.past || `I ${verb.v2}.`;

  const wrongs = [
    `I ${verb.v1}.`,
    `I have ${verb.v3}.`,
    `I am ${verb.v1}ing.`
  ];

  const options = shuffleArray([correct, ...wrongs]);

  return {
    verbId: verb._id,
    verbName: verb.v1,
    type: 'TRANSLATION',
    question: `Translate: "${hindiText}"`,
    options,
    correctAnswer: correct
  };
};

// ==================== @desc    Calculate practice score ====================
export const calculatePracticeScore = (questions, answers) => {
  if (!questions || !answers) return { score: 0, correct: 0, wrong: 0, total: 0 };

  let correct = 0;
  let wrong = 0;

  questions.forEach((q, index) => {
    const userAnswer = answers[index];
    let isCorrect = false;

    if (typeof userAnswer === 'number' && q.options) {
      isCorrect = q.options[userAnswer] === q.correctAnswer;
    } else if (typeof userAnswer === 'string') {
      isCorrect = userAnswer === q.correctAnswer;
    }

    if (isCorrect) correct++;
    else wrong++;
  });

  const total = questions.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  return { score, correct, wrong, total };
};

// ==================== @desc    Get practice recommendations ====================
export const getPracticeRecommendations = (weakVerbs, dueVerbs) => {
  const recommendations = [];

  if (weakVerbs && weakVerbs.length > 0) {
    recommendations.push({
      type: 'weak',
      title: 'Weak Verbs',
      description: 'Practice these verbs to improve your mastery',
      verbs: weakVerbs.slice(0, 5).map(v => ({
        verb: v.verbName || v.verbId?.v1,
        masteryScore: v.masteryScore
      }))
    });
  }

  if (dueVerbs && dueVerbs.length > 0) {
    recommendations.push({
      type: 'due',
      title: 'Due for Review',
      description: 'These verbs are due for spaced repetition',
      verbs: dueVerbs.slice(0, 5).map(v => ({
        verb: v.verbName || v.verbId?.v1,
        nextReviewAt: v.nextReviewAt
      }))
    });
  }

  return recommendations;
};

// ==================== @desc    Get practice type label ====================
export const getPracticeTypeLabel = (type) => {
  const labels = {
    V2: 'Past Form (V2)',
    V3: 'Past Participle (V3)',
    MEANING: 'Hindi Meaning',
    TRANSLATION: 'Translation'
  };
  return labels[type] || type;
};