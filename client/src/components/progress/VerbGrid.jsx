import React, { useState } from 'react';
import { Search, Filter, Grid3x3, List, ChevronDown } from 'lucide-react';
import VerbProgressCard from './VerbProgressCard';
import Button from '../common/Button';

const VerbGrid = ({ 
  verbs, 
  onVerbClick, 
  className = '',
  showFilters = true,
  defaultView = 'grid'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState(defaultView);
  const [sortBy, setSortBy] = useState('day');

  const getFilteredVerbs = () => {
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
    if (filter === 'mastered') {
      filtered = filtered.filter(v => v.progress?.status === 'mastered');
    } else if (filter === 'learned') {
      filtered = filtered.filter(v => v.progress?.status === 'learned' && v.progress?.status !== 'mastered');
    } else if (filter === 'learning') {
      filtered = filtered.filter(v => v.progress?.status === 'learning');
    } else if (filter === 'locked') {
      filtered = filtered.filter(v => v.isLocked);
    } else if (filter === 'not_started') {
      filtered = filtered.filter(v => !v.isLocked && !v.progress);
    }

    // Sort
    if (sortBy === 'day') {
      filtered.sort((a, b) => a.day - b.day);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.v1.localeCompare(b.v1));
    } else if (sortBy === 'mastery') {
      filtered.sort((a, b) => (b.progress?.masteryScore || 0) - (a.progress?.masteryScore || 0));
    }

    return filtered;
  };

  const filteredVerbs = getFilteredVerbs();

  const getFilterStats = () => {
    const total = verbs.length;
    const mastered = verbs.filter(v => v.progress?.status === 'mastered').length;
    const learned = verbs.filter(v => v.progress?.status === 'learned').length;
    const learning = verbs.filter(v => v.progress?.status === 'learning').length;
    const locked = verbs.filter(v => v.isLocked).length;

    return { total, mastered, learned, learning, locked };
  };

  const stats = getFilterStats();

  return (
    <div className={className}>
      {/* Filters */}
      {showFilters && (
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
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
            <div className="flex gap-2">
              <select
                className="input-field w-auto min-w-[120px]"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All ({stats.total})</option>
                <option value="mastered">⭐ Mastered ({stats.mastered})</option>
                <option value="learned">✅ Learned ({stats.learned})</option>
                <option value="learning">📖 Learning ({stats.learning})</option>
                <option value="not_started">📋 Not Started</option>
                <option value="locked">🔒 Locked ({stats.locked})</option>
              </select>
              <select
                className="input-field w-auto min-w-[120px]"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="day">Sort by Day</option>
                <option value="name">Sort by Name</option>
                <option value="mastery">Sort by Mastery</option>
              </select>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex justify-end gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing {filteredVerbs.length} of {verbs.length} verbs
      </p>

      {/* Verb Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVerbs.map((verb) => (
            <VerbProgressCard
              key={verb._id}
              verb={verb}
              progress={verb.progress}
              onClick={onVerbClick}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVerbs.map((verb) => (
            <VerbProgressCard
              key={verb._id}
              verb={verb}
              progress={verb.progress}
              onClick={onVerbClick}
              className="p-4"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredVerbs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No verbs found matching your filters</p>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => {
              setSearchTerm('');
              setFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default VerbGrid;