import Verb from '../models/Verb.js';
import User from '../models/User.js';
import UserVerbProgress from '../models/UserVerbProgress.js';
import { generatePracticeQuestions } from '../services/practiceService.js';
import { updateSpacedRepetition } from '../services/spacedRepetitionService.js';
import { addXP } from '../services/gamificationService.js';

// ==================== @desc    Get daily practice ====================
// @route   GET /api/practice/daily
// @access  Private
export const getDailyPractice = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentDay = user.currentCourseDay + 1;

    // Get verbs from current and previous days
    const verbs = await Verb.find({
      day: { $lte: currentDay }
    });

    if (!verbs.length) {
      return res.status(404).json({ message: 'No verbs available for practice' });
    }

    const questions = generatePracticeQuestions(verbs, 10);

    res.json({
      totalQuestions: questions.length,
      questions,
      day: currentDay
    });
  } catch (error) {
    console.error('getDailyPractice error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Submit practice ====================
// @route   POST /api/practice/submit
// @access  Private
export const submitPractice = async (req, res) => {
  try {
    const { answers, questions } = req.body;
    const userId = req.user._id;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'Invalid practice submission' });
    }

    let correct = 0;
    let wrong = 0;

    const results = await Promise.all(
      questions.map(async (q, index) => {
        const userAnswer = answers[index];
        const isCorrect = q.options && userAnswer !== undefined
          ? q.options[userAnswer] === q.correctAnswer
          : userAnswer === q.correctAnswer;

        if (isCorrect) correct++; else wrong++;

        // Update verb progress
        if (q.verbId) {
          const progress = await UserVerbProgress.findOne({
            userId,
            verbId: q.verbId
          });

          if (progress) {
            if (isCorrect) {
              progress.correctAnswers += 1;
              progress.masteryScore = Math.min(100, progress.masteryScore + 2);
            } else {
              progress.wrongAnswers += 1;
              progress.masteryScore = Math.max(0, progress.masteryScore - 1);
            }

            progress.lastAnswerCorrect = isCorrect;
            progress.timesSeen = (progress.timesSeen || 0) + 1;
            progress.lastReviewedAt = new Date();

            // Update spaced repetition
            const nextReview = await updateSpacedRepetition(progress, isCorrect);
            progress.nextReviewAt = nextReview;

            // Update status based on mastery
            if (progress.masteryScore >= 90) {
              progress.status = 'mastered';
            } else if (progress.masteryScore >= 70) {
              progress.status = 'learned';
            } else if (progress.masteryScore >= 40) {
              progress.status = 'learning';
            } else {
              progress.status = 'revising';
            }

            await progress.save();
          }
        }

        return {
          ...q,
          userAnswer: q.options && userAnswer !== undefined ? q.options[userAnswer] : userAnswer,
          isCorrect
        };
      })
    );

    const score = Math.round((correct / questions.length) * 100);

    // Award XP
    const xpEarned = 10 + (score === 100 ? 20 : 0);
    await addXP(userId, xpEarned);

    res.json({
      score,
      correct,
      wrong,
      total: questions.length,
      results,
      xpEarned
    });
  } catch (error) {
    console.error('submitPractice error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get practice by verb ====================
// @route   GET /api/practice/verb/:verbId
// @access  Private
export const getPracticeByVerb = async (req, res) => {
  try {
    const { verbId } = req.params;

    const verb = await Verb.findById(verbId);
    if (!verb) {
      return res.status(404).json({ message: 'Verb not found' });
    }

    // Generate focused practice for this verb
    const questions = generatePracticeQuestions([verb, verb, verb], 5);

    res.json({
      verb: verb.v1,
      totalQuestions: questions.length,
      questions
    });
  } catch (error) {
    console.error('getPracticeByVerb error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get practice by category ====================
// @route   GET /api/practice/category/:category
// @access  Private
export const getPracticeByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.user._id;
    const user = await User.findById(userId);

    const validCategories = ['v1', 'v2', 'v3', 'meaning', 'translation'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const verbs = await Verb.find({ day: { $lte: user.currentCourseDay + 1 } });
    const questions = generatePracticeQuestions(verbs, 10);

    res.json({
      category,
      totalQuestions: questions.length,
      questions
    });
  } catch (error) {
    console.error('getPracticeByCategory error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get quick practice ====================
// @route   GET /api/practice/quick
// @access  Private
export const getQuickPractice = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const verbs = await Verb.find({ day: { $lte: user.currentCourseDay + 1 } });
    const questions = generatePracticeQuestions(verbs, 5);

    res.json({
      totalQuestions: questions.length,
      questions    });
  } catch (error) {
    console.error('getQuickPractice error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get practice history ====================
// @route   GET /api/practice/history
// @access  Private
export const getPracticeHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const progress = await UserVerbProgress.find({ userId })
      .populate('verbId', 'v1')
      .sort({ lastReviewedAt: -1 })
      .limit(50);

    const history = progress
      .filter(p => p.lastReviewedAt && p.verbId)
      .map(p => ({
        verb: p.verbId.v1,
        correct: p.correctAnswers,
        wrong: p.wrongAnswers,
        masteryScore: p.masteryScore,
        lastReviewedAt: p.lastReviewedAt,
        nextReviewAt: p.nextReviewAt
      }));

    res.json(history);
  } catch (error) {
    console.error('getPracticeHistory error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get practice statistics ====================
// @route   GET /api/practice/stats
// @access  Private
export const getPracticeStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const progress = await UserVerbProgress.find({ userId });

    const totalCorrect = progress.reduce((sum, p) => sum + (p.correctAnswers || 0), 0);
    const totalWrong = progress.reduce((sum, p) => sum + (p.wrongAnswers || 0), 0);
    const totalAttempts = totalCorrect + totalWrong;
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    res.json({
      totalCorrect,
      totalWrong,
      totalAttempts,
      accuracy,
      verbsPracticed: progress.length
    });
  } catch (error) {
    console.error('getPracticeStats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get spaced repetition practice ====================
// @route   GET /api/practice/spaced-repetition
// @access  Private
export const getSpacedRepetition = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const dueProgress = await UserVerbProgress.find({
      userId,
      nextReviewAt: { $lte: now }
    })
      .populate('verbId')
      .limit(15);

    const dueVerbs = dueProgress.filter(p => p.verbId).map(p => p.verbId);
    const questions = generatePracticeQuestions(dueVerbs, dueVerbs.length);

    res.json({
      totalQuestions: questions.length,
      dueCount: dueVerbs.length,
      questions
    });
  } catch (error) {
    console.error('getSpacedRepetition error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Submit spaced repetition result ====================
// @route   POST /api/practice/spaced-repetition
// @access  Private
export const submitSpacedRepetition = async (req, res) => {
  try {
    const userId = req.user._id;
    const { verbId, isCorrect } = req.body;

    const progress = await UserVerbProgress.findOne({ userId, verbId });
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    if (isCorrect) {
      progress.correctAnswers += 1;
      progress.masteryScore = Math.min(100, progress.masteryScore + 3);
    } else {
      progress.wrongAnswers += 1;
      progress.masteryScore = Math.max(0, progress.masteryScore - 2);
    }

    const nextReview = await updateSpacedRepetition(progress, isCorrect);
    progress.nextReviewAt = nextReview;
    progress.lastReviewedAt = new Date();

    await progress.save();

    res.json({ success: true, nextReviewAt: nextReview });
  } catch (error) {
    console.error('submitSpacedRepetition error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get weak verb practice ====================
// @route   GET /api/practice/weak
// @access  Private
export const getWeakVerbPractice = async (req, res) => {
  try {
    const userId = req.user._id;

    const weakProgress = await UserVerbProgress.find({
      userId,
      masteryScore: { $lt: 40 }
    })
      .populate('verbId')
      .limit(10);

    const weakVerbs = weakProgress.filter(p => p.verbId).map(p => p.verbId);

    if (!weakVerbs.length) {
      return res.json({
        totalQuestions: 0,
        questions: [],
        message: 'No weak verbs to practice! Great job! 🎉'
      });
    }

    const questions = generatePracticeQuestions(weakVerbs, weakVerbs.length * 2);

    res.json({
      totalQuestions: questions.length,
      weakVerbsCount: weakVerbs.length,
      questions
    });
  } catch (error) {
    console.error('getWeakVerbPractice error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get custom practice ====================
// @route   GET /api/practice/custom
// @access  Private
export const getCustomPractice = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days, types, count = 10 } = req.query;
    const user = await User.findById(userId);

    let query = { day: { $lte: user.currentCourseDay + 1 } };

    if (days) {
      const dayList = Array.isArray(days) ? days.map(Number) : [Number(days)];
      query.day = { $in: dayList };
    }

    const verbs = await Verb.find(query);
    const questions = generatePracticeQuestions(verbs, parseInt(count));

    res.json({
      totalQuestions: questions.length,
      questions
    });
  } catch (error) {
    console.error('getCustomPractice error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get practice recommendations ====================
// @route   GET /api/practice/recommendations
// @access  Private
export const getPracticeRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get weak verbs
    const weakProgress = await UserVerbProgress.find({
      userId,
      masteryScore: { $lt: 40 }
    })
      .populate('verbId')
      .limit(5);

    // Get due for review
    const dueProgress = await UserVerbProgress.find({
      userId,
      nextReviewAt: { $lte: new Date() }
    })
      .populate('verbId')
      .limit(5);

    const recommendations = {
      weakVerbs: weakProgress
        .filter(p => p.verbId)
        .map(p => ({
          verb: p.verbId.v1,
          meaning: p.verbId.meaning,
          masteryScore: p.masteryScore
        })),
      dueForReview: dueProgress
        .filter(p => p.verbId)
        .map(p => ({
          verb: p.verbId.v1,
          meaning: p.verbId.meaning,
          nextReviewAt: p.nextReviewAt
        }))
    };

    res.json(recommendations);
  } catch (error) {
    console.error('getPracticeRecommendations error:', error);
    res.status(500).json({ message: error.message });
  }
};