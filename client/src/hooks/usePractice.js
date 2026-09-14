import { useState, useCallback } from 'react';
import { getDailyPractice, submitPractice } from '../api/practice';
import toast from 'react-hot-toast';

export const usePractice = () => {
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [practiceResult, setPracticeResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const fetchPractice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getDailyPractice();
      setPracticeQuestions(data.questions);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setPracticeResult(null);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load practice questions');
      console.error('Error fetching practice:', err);
      toast.error('Failed to load practice');
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
    setCurrentQuestionIndex(prev => Math.min(prev + 1, practiceQuestions.length - 1));
  }, [practiceQuestions.length]);

  const goToPreviousQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const goToQuestion = useCallback((index) => {
    setCurrentQuestionIndex(Math.max(0, Math.min(index, practiceQuestions.length - 1)));
  }, [practiceQuestions.length]);

  const submitPracticeAnswers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const answeredCount = Object.keys(answers).length;
      if (answeredCount < practiceQuestions.length) {
        toast.error(`Please answer all ${practiceQuestions.length} questions`);
        setLoading(false);
        return null;
      }

      const { data } = await submitPractice({
        answers,
        questions: practiceQuestions
      });

      setPracticeResult(data);
      toast.success('Practice submitted successfully!');
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit practice');
      console.error('Error submitting practice:', err);
      toast.error('Failed to submit practice');
      return null;
    } finally {
      setLoading(false);
    }
  }, [answers, practiceQuestions]);

  const resetPractice = useCallback(() => {
    setPracticeQuestions([]);
    setPracticeResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setError(null);
  }, []);

  const getAnsweredCount = useCallback(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const isAllAnswered = useCallback(() => {
    return Object.keys(answers).length === practiceQuestions.length;
  }, [answers, practiceQuestions.length]);

  const getScore = useCallback(() => {
    if (!practiceResult) return 0;
    return practiceResult.score;
  }, [practiceResult]);

  const getCorrectCount = useCallback(() => {
    if (!practiceResult) return 0;
    return practiceResult.correct;
  }, [practiceResult]);

  const getWrongCount = useCallback(() => {
    if (!practiceResult) return 0;
    return practiceResult.wrong;
  }, [practiceResult]);

  const getQuestionStatus = useCallback((index) => {
    if (answers[index] !== undefined) return 'answered';
    return 'unanswered';
  }, [answers]);

  const isQuestionCorrect = useCallback((index) => {
    if (!practiceResult?.results) return false;
    return practiceResult.results[index]?.isCorrect;
  }, [practiceResult]);

  const getUserAnswer = useCallback((index) => {
    if (!practiceResult?.results) return null;
    return practiceResult.results[index]?.userAnswer;
  }, [practiceResult]);

  const getCorrectAnswer = useCallback((index) => {
    if (!practiceResult?.results) return null;
    return practiceResult.results[index]?.correctAnswer;
  }, [practiceResult]);

  return {
    practiceQuestions,
    practiceResult,
    loading,
    error,
    answers,
    currentQuestionIndex,
    fetchPractice,
    answerQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    submitPracticeAnswers,
    resetPractice,
    getAnsweredCount,
    isAllAnswered,
    getScore,
    getCorrectCount,
    getWrongCount,
    getQuestionStatus,
    isQuestionCorrect,
    getUserAnswer,
    getCorrectAnswer
  };
};