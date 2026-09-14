import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  Award,
  CheckCircle,
  Clock,
  Target,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { getStats, getDailyProgress, getVerbProgress } from '../api/progress';
import { getCourseTimeline } from '../api/course';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProgressPage = () => {
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [dailyProgress, setDailyProgress] = useState([]);
  const [verbProgress, setVerbProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, timelineRes, dailyRes, verbRes] = await Promise.all([
          getStats(),
          getCourseTimeline(),
          getDailyProgress(),
          getVerbProgress()
        ]);
        setStats(statsRes.data);
        setTimeline(timelineRes.data);
        setDailyProgress(dailyRes.data);
        setVerbProgress(verbRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching progress data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const completedDays = timeline.filter(d => d.completed).length;
  const progress = (completedDays / 30) * 100;

  const getDayStatus = (day) => {
    const info = timeline.find(d => d.day === day);
    if (!info) return 'locked';
    if (info.completed) return 'completed';
    if (info.isCurrent) return 'current';
    return 'locked';
  };

  const getDayIcon = (day) => {
    const status = getDayStatus(day);
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'current') return <Target className="w-5 h-5 text-primary-600" />;
    return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
  };

  const getDayColor = (day) => {
    const status = getDayStatus(day);
    if (status === 'completed') return 'bg-green-50 border-green-200';
    if (status === 'current') return 'bg-primary-50 border-primary-300 ring-2 ring-primary-500';
    return 'bg-gray-50 border-gray-200 opacity-50';
  };

  const selectedDayData = selectedDay ? timeline.find(d => d.day === selectedDay) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Progress</h1>
        <p className="text-gray-600 mt-1">Track your learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Days Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedDays}/30</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Verbs Mastered</p>
              <p className="text-2xl font-bold text-yellow-600">{stats?.masteredVerbs || 0}/120</p>
            </div>
            <Award className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Score</p>
              <p className="text-2xl font-bold text-purple-600">{stats?.averageScore || 0}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Streak</p>
              <p className="text-2xl font-bold text-orange-600">🔥 {stats?.streak || 0}</p>
            </div>
            <Sparkles className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900">Overall Progress</h3>
          <span className="text-sm font-medium text-primary-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Day 1</span>
          <span>Day 15</span>
          <span>Day 30</span>
        </div>
      </div>

      {/* 30-Day Timeline */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">30-Day Timeline</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
            const isTestDay = day % 7 === 0;
            const status = getDayStatus(day);
            const dayInfo = timeline.find(d => d.day === day);

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                className={`
                  p-2 rounded-lg border-2 text-center transition-all duration-200
                  ${getDayColor(day)}
                  ${selectedDay === day ? 'ring-2 ring-primary-500' : ''}
                  hover:shadow-md
                `}
              >
                <div className="flex flex-col items-center gap-1">
                  {getDayIcon(day)}
                  <span className={`text-xs font-medium ${status === 'locked' ? 'text-gray-400' : 'text-gray-700'}`}>
                    {day}
                  </span>
                  {isTestDay && (
                    <span className="text-[8px] text-primary-600 font-bold">TEST</span>
                  )}
                  {dayInfo?.score > 0 && status === 'completed' && (
                    <span className="text-[10px] text-green-600 font-medium">
                      {dayInfo.score}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDayData && (
        <div className="card animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                Day {selectedDayData.day}
                {selectedDayData.isTestDay && ' 📝 Test Day'}
              </h3>
              <p className="text-sm text-gray-500">
                {selectedDayData.completed ? '✅ Completed' : selectedDayData.isCurrent ? '🔄 In Progress' : '🔒 Locked'}
              </p>
            </div>
            {selectedDayData.score > 0 && (
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">{selectedDayData.score}%</p>
                <p className="text-xs text-gray-500">Score</p>
              </div>
            )}
          </div>

          {selectedDayData.verbCount > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600">
                {selectedDayData.verbCount} verbs on this day
              </p>
            </div>
          )}

          {selectedDayData.completed && selectedDayData.completedAt && (
            <p className="text-xs text-gray-400 mt-2">
              Completed: {new Date(selectedDayData.completedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Verb Progress by Day */}
      {Object.keys(verbProgress).length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Verb Mastery by Day</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {Object.entries(verbProgress)
              .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
              .slice(0, 15)
              .map(([day, verbs]) => {
                const mastered = verbs.filter(v => v.status === 'mastered').length;
                const learned = verbs.filter(v => v.status === 'learned').length;
                const total = verbs.length;

                return (
                  <div key={day} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">Day {day}</span>
                      <span className="text-xs text-gray-500">
                        {mastered} mastered • {learned} learned • {total} total
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {verbs.map((v, idx) => (
                        <div
                          key={idx}
                          className="flex-1 h-2 rounded-full"
                          style={{
                            background: v.status === 'mastered' ? '#fbbf24' :
                                       v.status === 'learned' ? '#34d399' :
                                       v.status === 'learning' ? '#60a5fa' :
                                       '#d1d5db'
                          }}
                          title={`${v.verbName}: ${v.status}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <span>Mastered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span>Learned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400" />
          <span>Learning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          <span>Not Started</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;