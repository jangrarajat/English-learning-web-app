// ==================== Question Types ====================
export const QUESTION_TYPES = {
  V2_FROM_V1: 'V2_FROM_V1',
  V3_FROM_V1: 'V3_FROM_V1',
  V1_FROM_V2: 'V1_FROM_V2',
  V1_FROM_V3: 'V1_FROM_V3',
  MEANING_FROM_V1: 'MEANING_FROM_V1',
  V1_FROM_MEANING: 'V1_FROM_MEANING',
  FILL_BLANK: 'FILL_BLANK',
  SENTENCE_CORRECTION: 'SENTENCE_CORRECTION',
  TRANSLATION: 'TRANSLATION'
};

// ==================== @desc    Generate test questions ====================
export const generateTestQuestions = (verbs, count) => {
  if (!verbs || !verbs.length) return [];

  const questions = [];
  const shuffledVerbs = shuffleArray([...verbs]);
  const questionTypes = Object.values(QUESTION_TYPES);
  const totalQuestions = Math.min(count, shuffledVerbs.length * 3);

  let verbIndex = 0;
  let typeIndex = 0;

  for (let i = 0; i < totalQuestions; i++) {
    const verb = shuffledVerbs[verbIndex % shuffledVerbs.length];
    const type = questionTypes[typeIndex % questionTypes.length];

    const question = generateQuestion(verb, type, verbs);
    if (question) {
      questions.push(question);
    }

    verbIndex++;
    typeIndex++;

    // Cycle through types faster for variety
    if (typeIndex >= questionTypes.length * 2) {
      typeIndex = 0;
    }
  }

  return shuffleArray(questions).slice(0, count);
};

// ==================== @desc    Generate single question ====================
const generateQuestion = (verb, type, allVerbs = []) => {
  try {
    switch (type) {
      case QUESTION_TYPES.V2_FROM_V1:
        return generateV2FromV1(verb, allVerbs);
      case QUESTION_TYPES.V3_FROM_V1:
        return generateV3FromV1(verb, allVerbs);
      case QUESTION_TYPES.V1_FROM_V2:
        return generateV1FromV2(verb, allVerbs);
      case QUESTION_TYPES.V1_FROM_V3:
        return generateV1FromV3(verb, allVerbs);
      case QUESTION_TYPES.MEANING_FROM_V1:
        return generateMeaningFromV1(verb, allVerbs);
      case QUESTION_TYPES.V1_FROM_MEANING:
        return generateV1FromMeaning(verb, allVerbs);
      case QUESTION_TYPES.FILL_BLANK:
        return generateFillBlank(verb);
      case QUESTION_TYPES.SENTENCE_CORRECTION:
        return generateSentenceCorrection(verb);
      case QUESTION_TYPES.TRANSLATION:
        return generateTranslation(verb);
      default:
        return generateV2FromV1(verb, allVerbs);
    }
  } catch (error) {
    console.error('generateQuestion error:', error);
    return null;
  }
};

// ==================== Question Generators ====================

const generateV2FromV1 = (verb, allVerbs) => {
  const wrongOptions = getWrongV2Options(verb, allVerbs);
  const options = shuffleArray([verb.v2, ...wrongOptions.slice(0, 3)]);

  return {
    type: QUESTION_TYPES.V2_FROM_V1,
    verbId: verb._id,
    verbName: verb.v1,
    question: `What is the V2 (Past) of "${verb.v1}"?`,
    options,
    correctAnswer: verb.v2
  };
};

const generateV3FromV1 = (verb, allVerbs) => {
  const wrongOptions = getWrongV3Options(verb, allVerbs);
  const options = shuffleArray([verb.v3, ...wrongOptions.slice(0, 3)]);

  return {
    type: QUESTION_TYPES.V3_FROM_V1,
    verbId: verb._id,
    verbName: verb.v1,
    question: `What is the V3 (Past Participle) of "${verb.v1}"?`,
    options,
    correctAnswer: verb.v3
  };
};

const generateV1FromV2 = (verb, allVerbs) => {
  const wrongOptions = getWrongV1Options(verb, allVerbs);
  const options = shuffleArray([verb.v1, ...wrongOptions.slice(0, 3)]);

  return {
    type: QUESTION_TYPES.V1_FROM_V2,
    verbId: verb._id,
    verbName: verb.v1,
    question: `"${verb.v2}" is the V2 of which verb?`,
    options,
    correctAnswer: verb.v1
  };
};

const generateV1FromV3 = (verb, allVerbs) => {
  const wrongOptions = getWrongV1Options(verb, allVerbs);
  const options = shuffleArray([verb.v1, ...wrongOptions.slice(0, 3)]);

  return {
    type: QUESTION_TYPES.V1_FROM_V3,
    verbId: verb._id,
    verbName: verb.v1,
    question: `"${verb.v3}" is the V3 of which verb?`,
    options,
    correctAnswer: verb.v1
  };
};

const generateMeaningFromV1 = (verb, allVerbs) => {
  const wrongMeanings = allVerbs
    .filter(v => v._id.toString() !== verb._id.toString())
    .slice(0, 3)
    .map(v => v.meaning);

  // Fill with generic if not enough
  while (wrongMeanings.length < 3) {
    wrongMeanings.push('karna');
  }

  const options = shuffleArray([verb.meaning, ...wrongMeanings]);

  return {
    type: QUESTION_TYPES.MEANING_FROM_V1,
    verbId: verb._id,
    verbName: verb.v1,
    question: `What does "${verb.v1}" mean in Hindi?`,
    options,
    correctAnswer: verb.meaning
  };
};

const generateV1FromMeaning = (verb, allVerbs) => {
  const wrongVerbs = allVerbs
    .filter(v => v._id.toString() !== verb._id.toString())
    .slice(0, 3)
    .map(v => v.v1);

  while (wrongVerbs.length < 3) {
    wrongVerbs.push('go');
  }

  const options = shuffleArray([verb.v1, ...wrongVerbs]);

  return {
    type: QUESTION_TYPES.V1_FROM_MEANING,
    verbId: verb._id,
    verbName: verb.v1,
    question: `Which verb means "${verb.meaning}"?`,
    options,
    correctAnswer: verb.v1
  };
};

const generateFillBlank = (verb) => {
  const wrongOptions = [
    verb.v1,
    verb.v3,
    verb.v1 + 'ing'
  ];

  const options = shuffleArray([verb.v2, ...wrongOptions]);

  return {
    type: QUESTION_TYPES.FILL_BLANK,
    verbId: verb._id,
    verbName: verb.v1,
    question: `Yesterday I ____ to the market. (${verb.v1})`,
    options,
    correctAnswer: verb.v2
  };
};

const generateSentenceCorrection = (verb) => {
  const correct = `I ${verb.v2} yesterday.`;
  const wrong1 = `I ${verb.v1} yesterday.`;
  const wrong2 = `I have ${verb.v3} yesterday.`;
  const wrong3 = `I am ${verb.v1}ing yesterday.`;

  const options = shuffleArray([correct, wrong1, wrong2, wrong3]);

  return {
    type: QUESTION_TYPES.SENTENCE_CORRECTION,
    verbId: verb._id,
    verbName: verb.v1,
    question: `Choose the correct sentence using "${verb.v1}":`,
    options,
    correctAnswer: correct
  };
};

const generateTranslation = (verb) => {
  // Hindi to English translation
  const hindiTranslation = verb.hindiTranslations?.past || `Main ${verb.meaning} karta tha.`;
  const correct = verb.examples?.past || `I ${verb.v2}.`;

  const wrongOptions = [
    `I ${verb.v1}.`,
    `I have ${verb.v3}.`,
    `I am ${verb.v1}ing.`
  ];

  const options = shuffleArray([correct, ...wrongOptions]);

  return {
    type: QUESTION_TYPES.TRANSLATION,
    verbId: verb._id,
    verbName: verb.v1,
    question: `Translate to English: "${hindiTranslation}"`,
    options,
    correctAnswer: correct
  };
};

// ==================== Wrong Option Generators ====================

const getWrongV2Options = (verb, allVerbs) => {
  const wrongs = [];

  // Add V3 as wrong option (common confusion)
  if (verb.v3 !== verb.v2) {
    wrongs.push(verb.v3);
  }

  // Add similar verbs from the same day
  const sameDayVerbs = allVerbs.filter(
    v => v.day === verb.day && v._id.toString() !== verb._id.toString()
  );

  sameDayVerbs.forEach(v => {
    if (!wrongs.includes(v.v2) && wrongs.length < 4) {
      wrongs.push(v.v2);
    }
  });

  // Fallback: add generic wrong options
  const genericWrongs = ['went', 'gone', 'came', 'took', 'made'];
  for (const g of genericWrongs) {
    if (!wrongs.includes(g) && wrongs.length < 4 && g !== verb.v2) {
      wrongs.push(g);
    }
  }

  return shuffleArray(wrongs).slice(0, 3);
};

const getWrongV3Options = (verb, allVerbs) => {
  const wrongs = [];

  if (verb.v2 !== verb.v3) {
    wrongs.push(verb.v2);
  }

  const sameDayVerbs = allVerbs.filter(
    v => v.day === verb.day && v._id.toString() !== verb._id.toString()
  );

  sameDayVerbs.forEach(v => {
    if (!wrongs.includes(v.v3) && wrongs.length < 4) {
      wrongs.push(v.v3);
    }
  });

  const genericWrongs = ['gone', 'been', 'seen', 'taken', 'made'];
  for (const g of genericWrongs) {
    if (!wrongs.includes(g) && wrongs.length < 4 && g !== verb.v3) {
      wrongs.push(g);
    }
  }

  return shuffleArray(wrongs).slice(0, 3);
};

const getWrongV1Options = (verb, allVerbs) => {
  const wrongs = [];

  const otherVerbs = allVerbs.filter(
    v => v._id.toString() !== verb._id.toString()
  );

  shuffleArray(otherVerbs).forEach(v => {
    if (!wrongs.includes(v.v1) && wrongs.length < 3) {
      wrongs.push(v.v1);
    }
  });

  const genericWrongs = ['go', 'come', 'take', 'make', 'have'];
  for (const g of genericWrongs) {
    if (!wrongs.includes(g) && wrongs.length < 3 && g !== verb.v1) {
      wrongs.push(g);
    }
  }

  return wrongs;
};

// ==================== Utility: Shuffle Array ====================
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ==================== @desc    Generate practice questions ====================
export const generatePracticeQuestions = (verbs, count) => {
  return generateTestQuestions(verbs, count);
};

// ==================== @desc    Calculate test score ====================
export const calculateScore = (questions, answers) => {
  if (!questions || !answers) return { score: 0, correct: 0, wrong: 0, total: 0 };

  let correct = 0;
  let wrong = 0;

  questions.forEach((q, index) => {
    const userAnswer = answers[index];

    // Handle both index-based and value-based answers
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

// ==================== @desc    Get test result message ====================
export const getTestResultMessage = (score) => {
  if (score >= 90) return { level: 'excellent', message: '🏆 Excellent! Outstanding performance!' };
  if (score >= 80) return { level: 'very-good', message: '🔥 Very Good! Keep it up!' };
  if (score >= 70) return { level: 'passed', message: '👍 Passed! Good effort!' };
  return { level: 'needs-revision', message: '📚 Needs Revision. Review weak verbs!' };
};

// ==================== @desc    Get weak verbs from test ====================
export const extractWeakVerbs = (detailedQuestions) => {
  const weakVerbs = [];
  const verbCounts = {};

  detailedQuestions.forEach(q => {
    if (!q.isCorrect && q.verbId) {
      const verbIdStr = q.verbId.toString();
      if (!verbCounts[verbIdStr]) {
        verbCounts[verbIdStr] = {
          verbId: q.verbId,
          verbName: q.verbName,
          timesWrong: 0
        };
      }
      verbCounts[verbIdStr].timesWrong++;
    }
  });

  Object.values(verbCounts).forEach(v => weakVerbs.push(v));
  return weakVerbs;
};