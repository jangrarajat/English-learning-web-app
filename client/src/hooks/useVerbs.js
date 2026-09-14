import { useState, useEffect, useCallback } from 'react';
import { getAllVerbs, getVerbsByDay, getVerbById } from '../api/verbs';
import { getDayVerbs } from '../api/course';

export const useVerbs = () => {
  const [verbs, setVerbs] = useState([]);
  const [filteredVerbs, setFilteredVerbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVerb, setSelectedVerb] = useState(null);

  const fetchAllVerbs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getAllVerbs();
      setVerbs(data);
      setFilteredVerbs(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch verbs');
      console.error('Error fetching verbs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVerbsByDay = useCallback(async (day) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getDayVerbs(day);
      setVerbs(data);
      setFilteredVerbs(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch verbs for day');
      console.error('Error fetching day verbs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVerbById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getVerbById(id);
      setSelectedVerb(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch verb');
      console.error('Error fetching verb:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const filterVerbs = useCallback((searchTerm, filterType = 'all', dayFilter = null) => {
    let filtered = [...verbs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(v =>
        v.v1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.v2.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.v3.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.meaning.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterType === 'learned') {
      filtered = filtered.filter(v => v.progress?.status === 'learned' || v.progress?.status === 'mastered');
    } else if (filterType === 'mastered') {
      filtered = filtered.filter(v => v.progress?.status === 'mastered');
    } else if (filterType === 'learning') {
      filtered = filtered.filter(v => v.progress?.status === 'learning');
    } else if (filterType === 'locked') {
      filtered = filtered.filter(v => v.isLocked);
    }

    // Day filter
    if (dayFilter) {
      filtered = filtered.filter(v => v.day === dayFilter);
    }

    setFilteredVerbs(filtered);
    return filtered;
  }, [verbs]);

  const getVerbStatus = useCallback((verb) => {
    if (verb.isLocked) return 'locked';
    if (verb.progress?.status) return verb.progress.status;
    return 'not_started';
  }, []);

  const getVerbMastery = useCallback((verb) => {
    return verb.progress?.masteryScore || 0;
  }, []);

  const getVerbsByStatus = useCallback((status) => {
    return verbs.filter(v => {
      if (status === 'locked') return v.isLocked;
      if (status === 'not_started') return !v.isLocked && !v.progress;
      return v.progress?.status === status;
    });
  }, [verbs]);

  const getVerbsByDayRange = useCallback((startDay, endDay) => {
    return verbs.filter(v => v.day >= startDay && v.day <= endDay);
  }, [verbs]);

  const getTotalVerbs = useCallback(() => {
    return verbs.length;
  }, [verbs]);

  const getLearnedVerbs = useCallback(() => {
    return verbs.filter(v => v.progress?.status === 'learned' || v.progress?.status === 'mastered');
  }, [verbs]);

  const getMasteredVerbs = useCallback(() => {
    return verbs.filter(v => v.progress?.status === 'mastered');
  }, [verbs]);

  const getLearningVerbs = useCallback(() => {
    return verbs.filter(v => v.progress?.status === 'learning');
  }, [verbs]);

  const getLockedVerbs = useCallback(() => {
    return verbs.filter(v => v.isLocked);
  }, [verbs]);

  const getWeakVerbsFromList = useCallback(() => {
    return verbs.filter(v => v.progress && v.progress.masteryScore < 40);
  }, [verbs]);

  return {
    verbs,
    filteredVerbs,
    selectedVerb,
    loading,
    error,
    fetchAllVerbs,
    fetchVerbsByDay,
    fetchVerbById,
    filterVerbs,
    getVerbStatus,
    getVerbMastery,
    getVerbsByStatus,
    getVerbsByDayRange,
    getTotalVerbs,
    getLearnedVerbs,
    getMasteredVerbs,
    getLearningVerbs,
    getLockedVerbs,
    getWeakVerbsFromList,
    setSelectedVerb
  };
};