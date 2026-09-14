import { useState, useCallback } from 'react';
import { getWeeklyTest, submitTest, getTestHistory } from '../api/tests';
import toast from 'react-hot-toast';

export const useTests = () => {
  const [testQuestions, setTestQuestions] = useState([]);
  const [testResult, setTestResult] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const fetchTest = useCallback(async (day) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getWeeklyTest(day);
      setTestQuestions(data.questions);
      setAnswers({});
      setCurrentQuestionIndex(0);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load test');
      console.error('Error fetching test:', err);
      toast.error('Failed to load test');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const answerQuestion = useCallback((questionIndex, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  }, []);

  const goToNextQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => Math.min(prev + 1, testQuestions.length - 1));
  }, [testQuestions.length]);

  const goToPreviousQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const goToQuestion = useCallback((index) => {
    setCurrentQuestionIndex(Math.max(0, Math.min(index, testQuestions.length - 1)));
  }, [testQuestions.length]);

  const submitTestAnswers = useCallback(async (day) => {
    try {
      setLoading(true);
      setError(null);

      // Check if all questions are answered
      const answeredCount = Object.keys(answers).length;
      if (answeredCount < testQuestions.length) {
        toast.error(`Please answer all ${testQuestions.length} questions`);
        setLoading(false);
        return null;
      }

      const { data } = await submitTest({
        day,
        answers,
        questions: testQuestions
      });

      setTestResult(data);
      toast.success('Test submitted successfully!');
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit test');
      console.error('Error submitting test:', err);
      toast.error('Failed to submit test');
      return null;
    } finally {
      setLoading(false);
    }
  }, [answers, testQuestions]);

  const fetchTestHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getTestHistory();
      setTestHistory(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch test history');
      console.error('Error fetching test history:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetTest = useCallback(() => {
    setTestQuestions([]);
    setTestResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setError(null);
  }, []);

  const getAnsweredCount = useCallback(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const isAllAnswered = useCallback(() => {
    return Object.keys(answers).length === testQuestions.length;
  }, [answers, testQuestions.length]);

  const getScore = useCallback(() => {
    if (!testResult) return 0;
    return testResult.score;
  }, [testResult]);

  const isPassed = useCallback(() => {
    if (!testResult) return false;
    return testResult.passed;
  }, [testResult]);

  const getWeakVerbs = useCallback(() => {
    if (!testResult) return [];
    return testResult.weakVerbs || [];
  }, [testResult]);

  const getQuestionStatus = useCallback((index) => {
    if (answers[index] !== undefined) return 'answered';
    return 'unanswered';
  }, [answers]);

  const getCorrectAnswer = useCallback((index) => {
    if (!testResult?.questions) return null;
    return testResult.questions[index]?.correctAnswer;
  }, [testResult]);

  const getUserAnswer = useCallback((index) => {
    if (!testResult?.questions) return null;
    return testResult.questions[index]?.userAnswer;
  }, [testResult]);

  const isQuestionCorrect = useCallback((index) => {
    if (!testResult?.questions) return false;
    return testResult.questions[index]?.isCorrect;
  }, [testResult]);

  return {
    testQuestions,
    testResult,
    testHistory,
    loading,
    error,
    answers,
    currentQuestionIndex,
    fetchTest,
    answerQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    submitTestAnswers,
    fetchTestHistory,
    resetTest,
    getAnsweredCount,
    isAllAnswered,
    getScore,
    isPassed,
    getWeakVerbs,
    getQuestionStatus,
    getCorrectAnswer,
    getUserAnswer,
    isQuestionCorrect
  };
};