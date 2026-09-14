import Verb from '../models/Verb.js';
import TestResult from '../models/TestResult.js';
import User from '../models/User.js';
import UserVerbProgress from '../models/UserVerbProgress.js';
import { generateTestQuestions } from '../services/testService.js';
import { addXP, checkAchievements } from '../services/gamificationService.js';
import { updateMasteryAfterTest } from '../services/spacedRepetitionService.js';

// ==================== Helper: Get verb count for test ====================
const getTestVerbCount = (testDay) => {
  if (testDay === 7) return 30;
  if (testDay === 14) return 60;
  if (testDay === 21) return 90;
  if (testDay === 28) return 120;
  return 0;
};

// ==================== @desc    Get weekly test ====================
// @route   GET /api/tests/weekly/:day
// @access  Private
export const getWeeklyTest = async (req, res) => {
  try {
    const { day } = req.params;
    const userId = req.user._id;
    const testDay = parseInt(day);

    // Validate test day
    const validTestDays = [7, 14, 21, 28];
    if (!validTestDays.includes(testDay)) {
      return res.status(400).json({ message: 'Invalid test day' });
    }

    // Check if user has completed prerequisites
    const user = await User.findById(userId);
    if (user.currentCourseDay + 1 < testDay) {
      return res.status(403).json({ message: 'Complete previous days first' });
    }

    // Get verbs for the test range
    const verbCount = getTestVerbCount(testDay);
    const verbs = await Verb.find({ day: { $lte: testDay - 1 } });

    if (verbs.length < verbCount) {
      return res.status(400).json({ 
        message: `Not enough verbs available. Need ${verbCount}, found ${verbs.length}` 
      });
    }

    // Generate random test questions
    const questions = generateTestQuestions(verbs, verbCount);

    res.json({
      day: testDay,
      totalQuestions: questions.length,
      verbCount,
      questions
    });
  } catch (error) {
    console.error('getWeeklyTest error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Submit test ====================
// @route   POST /api/tests/submit
// @access  Private
export const submitTest = async (req, res) => {
  try {
    const { day, answers, questions } = req.body;
    const userId = req.user._id;

    if (!day || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'Invalid test submission' });
    }

    const testDay = parseInt(day);
    let correct = 0;
    let wrong = 0;
    const weakVerbs = [];
    const verbWrongCounts = {};

    // Process each question
    const detailedQuestions = questions.map((q, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === q.correctAnswer;

      if (isCorrect) {
        correct++;
      } else {
        wrong++;

        // Track weak verbs
        if (q.verbId) {
          const verbIdStr = q.verbId.toString();
          if (!verbWrongCounts[verbIdStr]) {
            verbWrongCounts[verbIdStr] = {
              verbId: q.verbId,
              verbName: q.verbName,
              timesWrong: 0
            };
          }
          verbWrongCounts[verbIdStr].timesWrong++;
        }
      }

      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswer !== undefined ? q.options[userAnswer] : null,
        isCorrect,
        type: q.type,
        verbId: q.verbId,
        verbName: q.verbName
      };
    });

    // Add weak verbs
    Object.values(verbWrongCounts).forEach(v => weakVerbs.push(v));

    const totalQuestions = questions.length;
    const score = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

    // Determine test type
    const testType = testDay === 28 ? 'complete' : 'weekly';

    // Save test result
    const testResult = await TestResult.create({
      userId,
      testType,
      day: testDay,
      score,
      totalQuestions,
      correctAnswers: correct,
      wrongAnswers: wrong,
      weakVerbs,
      questions: detailedQuestions,
      completedAt: new Date()
    });

    // Update user stats
    const user = await User.findById(userId);
    const previousTests = user.testsCompleted || 0;
    const newTestsCompleted = previousTests + 1;
    const newAverageScore = Math.round(
      ((user.averageTestScore || 0) * previousTests + score) / newTestsCompleted
    );

    await User.findByIdAndUpdate(userId, {
      testsCompleted: newTestsCompleted,
      averageTestScore: newAverageScore
    });

    // Update verb mastery for each answered question
    await updateMasteryAfterTest(userId, detailedQuestions);

    // Add XP
    const xpEarned = 50 + (score === 100 ? 50 : score > 80 ? 20 : 0);
    await addXP(userId, xpEarned);

    // Check achievements
    const newAchievements = await checkAchievements(userId);

    res.json({
      success: true,
      testId: testResult._id,
      score,
      correctAnswers: correct,
      wrongAnswers: wrong,
      totalQuestions,
      passed: score >= 70,
      weakVerbs: weakVerbs.map(v => v.verbName),
      questions: detailedQuestions,
      xpEarned,
      newAchievements: newAchievements.map(a => a.badge),
      averageScore: newAverageScore
    });
  } catch (error) {
    console.error('submitTest error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get test history ====================
// @route   GET /api/tests/history
// @access  Private
export const getTestHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20 } = req.query;

    const tests = await TestResult.find({ userId })
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .select('-questions');

    res.json(tests);
  } catch (error) {
    console.error('getTestHistory error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get test result by ID ====================
// @route   GET /api/tests/result/:testId
// @access  Private
export const getTestResult = async (req, res) => {
  try {
    const userId = req.user._id;
    const { testId } = req.params;

    const test = await TestResult.findOne({
      _id: testId,
      userId
    });

    if (!test) {
      return res.status(404).json({ message: 'Test result not found' });
    }

    res.json(test);
  } catch (error) {
    console.error('getTestResult error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get test statistics ====================
// @route   GET /api/tests/stats
// @access  Private
export const getTestStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const tests = await TestResult.find({ userId });

    if (!tests.length) {
      return res.json({
        totalTests: 0,
        averageScore: 0,
        bestScore: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        totalWrong: 0
      });
    }

    const totalTests = tests.length;
    const averageScore = Math.round(tests.reduce((sum, t) => sum + t.score, 0) / totalTests);
    const bestScore = Math.max(...tests.map(t => t.score));
    const totalQuestions = tests.reduce((sum, t) => sum + t.totalQuestions, 0);
    const totalCorrect = tests.reduce((sum, t) => sum + t.correctAnswers, 0);
    const totalWrong = tests.reduce((sum, t) => sum + t.wrongAnswers, 0);

    res.json({
      totalTests,
      averageScore,
      bestScore,
      totalQuestions,
      totalCorrect,
      totalWrong,
      recentTests: tests.slice(-5).map(t => ({
        day: t.day,
        score: t.score,
        completedAt: t.completedAt
      }))
    });
  } catch (error) {
    console.error('getTestStats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get weak verbs from all tests ====================
// @route   GET /api/tests/weak-verbs
// @access  Private
export const getTestWeakVerbs = async (req, res) => {
  try {
    const userId = req.user._id;

    const tests = await TestResult.find({ userId });

    // Aggregate weak verbs
    const verbCounts = {};
    tests.forEach(test => {
      if (test.weakVerbs && test.weakVerbs.length) {
        test.weakVerbs.forEach(w => {
          const name = w.verbName;
          if (!verbCounts[name]) {
            verbCounts[name] = { verbName: name, timesWrong: 0 };
          }
          verbCounts[name].timesWrong += w.timesWrong || 1;
        });
      }
    });

    const weakVerbs = Object.values(verbCounts)
      .sort((a, b) => b.timesWrong - a.timesWrong)
      .slice(0, 20);

    res.json(weakVerbs);
  } catch (error) {
    console.error('getTestWeakVerbs error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Retry a test ====================
// @route   GET /api/tests/retry/:day
// @access  Private
export const retryTest = async (req, res) => {
  try {
    const { day } = req.params;
    const testDay = parseInt(day);

    const validTestDays = [7, 14, 21, 28];
    if (!validTestDays.includes(testDay)) {
      return res.status(400).json({ message: 'Invalid test day' });
    }

    const verbCount = getTestVerbCount(testDay);
    const verbs = await Verb.find({ day: { $lte: testDay - 1 } });

    const questions = generateTestQuestions(verbs, verbCount);

    res.json({
      day: testDay,
      totalQuestions: questions.length,
      verbCount,
      questions,
      isRetry: true
    });
  } catch (error) {
    console.error('retryTest error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get practice test (ungraded) ====================
// @route   GET /api/tests/practice?count=10
// @access  Private
export const getPracticeTest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { count = 10 } = req.query;
    const user = await User.findById(userId);

    const verbs = await Verb.find({ day: { $lte: user.currentCourseDay + 1 } });

    const questions = generateTestQuestions(verbs, parseInt(count));

    res.json({
      totalQuestions: questions.length,
      questions
    });
  } catch (error) {
    console.error('getPracticeTest error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get test review ====================
// @route   GET /api/tests/review/:testId
// @access  Private
export const getTestReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { testId } = req.params;

    const test = await TestResult.findOne({ _id: testId, userId });
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json({
      testId: test._id,
      day: test.day,
      score: test.score,
      questions: test.questions,
      weakVerbs: test.weakVerbs,
      completedAt: test.completedAt
    });
  } catch (error) {
    console.error('getTestReview error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Get final comprehensive test ====================
// @route   GET /api/tests/final
// @access  Private
export const getFinalTest = async (req, res) => {
  try {
    const verbs = await Verb.find();
    const questions = generateTestQuestions(verbs, 50);

    res.json({
      totalQuestions: questions.length,
      questions,
      isFinal: true
    });
  } catch (error) {
    console.error('getFinalTest error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== @desc    Submit final test ====================
// @route   POST /api/tests/final/submit
// @access  Private
export const submitFinalTest = async (req, res) => {
  try {
    const { answers, questions } = req.body;
    const userId = req.user._id;

    let correct = 0;
    let wrong = 0;

    const detailedQuestions = questions.map((q, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correct++; else wrong++;
      return { ...q, userAnswer, isCorrect };
    });

    const totalQuestions = questions.length;
    const score = Math.round((correct / totalQuestions) * 100);

    const testResult = await TestResult.create({
      userId,
      testType: 'final',
      day: 30,
      score,
      totalQuestions,
      correctAnswers: correct,
      wrongAnswers: wrong,
      weakVerbs: [],
      questions: detailedQuestions
    });

    // Award the 30-day challenge badge
    const user = await User.findById(userId);
    await User.findByIdAndUpdate(userId, {
      currentCourseDay: 30
    });

    res.json({
      success: true,
      testId: testResult._id,
      score,
      correctAnswers: correct,
      wrongAnswers: wrong,
      totalQuestions,
      courseCompleted: true
    });
  } catch (error) {
    console.error('submitFinalTest error:', error);
    res.status(500).json({ message: error.message });
  }
};