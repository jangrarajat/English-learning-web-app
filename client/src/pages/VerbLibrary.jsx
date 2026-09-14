import React, { useState, useEffect } from 'react';
import { Search, Lock, CheckCircle, BookOpen, Star, Filter } from 'lucide-react';
import { getAllVerbs } from '../api/verbs';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const VerbLibrary = () => {
  const { user } = useAuth();
  const [verbs, setVerbs] = useState([]);
  const [filteredVerbs, setFilteredVerbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedDay, setSelectedDay] = useState(null);
  const [expandedVerb, setExpandedVerb] = useState(null);

  useEffect(() => {
    const fetchVerbs = async () => {
      try {
        const { data } = await getAllVerbs();
        setVerbs(data);
        setFilteredVerbs(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching verbs:', error);
        setLoading(false);
      }
    };
    fetchVerbs();
  }, []);

  useEffect(() => {
    let filtered = verbs;

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
    if (filter === 'learned') {
      filtered = filtered.filter(v => v.progress?.status === 'learned' || v.progress?.status === 'mastered');
    } else if (filter === 'mastered') {
      filtered = filtered.filter(v => v.progress?.status === 'mastered');
    } else if (filter === 'learning') {
      filtered = filtered.filter(v => v.progress?.status === 'learning');
    } else if (filter === 'locked') {
      filtered = filtered.filter(v => v.isLocked);
    }

    // Day filter
    if (selectedDay) {
      filtered = filtered.filter(v => v.day === selectedDay);
    }

    setFilteredVerbs(filtered);
  }, [searchTerm, filter, selectedDay, verbs]);

  const getStatusIcon = (verb) => {
    if (verb.isLocked) return <Lock className="w-4 h-4 text-gray-400" />;
    if (verb.progress?.status === 'mastered') return <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
    if (verb.progress?.status === 'learned') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (verb.progress?.status === 'learning') return <BookOpen className="w-4 h-4 text-blue-500" />;
    return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
  };

  const getStatusColor = (verb) => {
    if (verb.isLocked) return 'bg-gray-100 text-gray-500';
    if (verb.progress?.status === 'mastered') return 'bg-yellow-100 text-yellow-700';
    if (verb.progress?.status === 'learned') return 'bg-green-100 text-green-700';
    if (verb.progress?.status === 'learning') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-500';
  };

  const getStatusText = (verb) => {
    if (verb.isLocked) return '🔒 Locked';
    if (verb.progress?.status === 'mastered') return '⭐ Mastered';
    if (verb.progress?.status === 'learned') return '✅ Learned';
    if (verb.progress?.status === 'learning') return '📖 Learning';
    return '📖 Not Started';
  };

  const getMasteryLevel = (score) => {
    if (score >= 90) return { label: 'Mastered', color: 'text-green-600' };
    if (score >= 70) return { label: 'Good', color: 'text-blue-600' };
    if (score >= 40) return { label: 'Learning', color: 'text-yellow-600' };
    return { label: 'Weak', color: 'text-red-600' };
  };

  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const maxDay = user?.currentCourseDay || 0;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Verb Library</h1>
        <p className="text-gray-600 mt-1">Search and track all 120 verbs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Verbs</p>
          <p className="text-2xl font-bold">{verbs.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Learned</p>
          <p className="text-2xl font-bold text-green-600">
            {verbs.filter(v => v.progress?.status === 'learned' || v.progress?.status === 'mastered').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Mastered</p>
          <p className="text-2xl font-bold text-yellow-600">
            {verbs.filter(v => v.progress?.status === 'mastered').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Locked</p>
          <p className="text-2xl font-bold text-gray-400">
            {verbs.filter(v => v.isLocked).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search verbs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              className="input-field w-auto min-w-[120px]"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="learning">Learning</option>
              <option value="learned">Learned</option>
              <option value="mastered">Mastered</option>
              <option value="locked">Locked</option>
            </select>

            {/* Day Filter */}
            <select
              className="input-field w-auto min-w-[120px]"
              value={selectedDay || ''}
              onChange={(e) => setSelectedDay(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">All Days</option>
              {days.map(d => (
                <option key={d} value={d}>
                  Day {d} {d <= maxDay ? '✅' : '🔒'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Verb Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVerbs.map((verb) => {
          const isExpanded = expandedVerb === verb._id;
          const mastery = getMasteryLevel(verb.progress?.masteryScore || 0);

          return (
            <div
              key={verb._id}
              className={`card cursor-pointer transition-all duration-200 ${
                isExpanded ? 'ring-2 ring-primary-500 shadow-lg' : ''
              } ${verb.isLocked ? 'opacity-70' : ''}`}
              onClick={() => setExpandedVerb(isExpanded ? null : verb._id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">{verb.v1}</h3>
                    <span className={`badge ${getStatusColor(verb)}`}>
                      {getStatusText(verb)}
                    </span>
                  </div>
                  <div className="flex gap-3 text-sm text-gray-600 mt-1">
                    <span>V2: {verb.v2}</span>
                    <span>V3: {verb.v3}</span>
                  </div>
                  <p className="text-gray-600 mt-1">{verb.meaning}</p>
                  <p className="text-xs text-gray-400 mt-1">Day {verb.day}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getStatusIcon(verb)}
                  {verb.progress && (
                    <span className={`text-xs font-medium ${mastery.color}`}>
                      {verb.progress.masteryScore || 0}%
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && !verb.isLocked && (
                <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                  {verb.progress && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Mastery Score</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              verb.progress.masteryScore >= 70 ? 'bg-green-500' :
                              verb.progress.masteryScore >= 40 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${verb.progress.masteryScore || 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Status: {verb.progress.status}</span>
                          <span>
                            ✅ {verb.progress.correctAnswers || 0} | ❌ {verb.progress.wrongAnswers || 0}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-500">Times Seen</p>
                          <p className="font-medium">{verb.progress.timesSeen || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-500">Last Reviewed</p>
                          <p className="font-medium">
                            {verb.progress.lastReviewedAt 
                              ? new Date(verb.progress.lastReviewedAt).toLocaleDateString()
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>

                      {verb.progress.nextReviewAt && (
                        <div className="bg-primary-50 p-2 rounded text-sm">
                          <p className="text-xs text-primary-600">Next Review</p>
                          <p className="font-medium">
                            {new Date(verb.progress.nextReviewAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Examples */}
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Examples:</p>
                    <div className="grid grid-cols-1 gap-1 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Present</p>
                        <p>{verb.examples?.present}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Past</p>
                        <p>{verb.examples?.past}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Perfect</p>
                        <p>{verb.examples?.perfect}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isExpanded && verb.isLocked && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-center text-gray-500 text-sm">
                  <Lock className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                  Complete previous days to unlock this verb
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredVerbs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No verbs found matching your filters</p>
        </div>
      )}

      {/* Legend */}
      <div className="card bg-gray-50">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>Mastered</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Learned</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>Learning</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-400" />
            <span>Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerbLibrary;