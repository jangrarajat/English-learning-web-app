import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  BookOpen, 
  Award, 
  Clock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [weakVerbs, setWeakVerbs] = useState([]);
  const [todayTask, setTodayTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, weakRes, courseRes] = await Promise.all([
          api.get('/progress/stats'),
          api.get('/progress/weak-verbs'),
          api.get('/course/current')
        ]);
        setStats(statsRes.data);
        setWeakVerbs(weakRes.data);
        setTodayTask(courseRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const currentDay = todayTask?.currentDay || 0;
  const isTestDay = todayTask?.isTestDay || false;
  const progress = stats ? (stats.totalVerbsLearned / 120) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Day {currentDay} of 30 — Keep the momentum going!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Day</p>
              <p className="text-2xl font-bold">{currentDay}/30</p>
            </div>
            <BookOpen className="w-8 h-8 text-primary-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Streak</p>
              <p className="text-2xl font-bold">🔥 {user?.streak || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Verbs Learned</p>
              <p className="text-2xl font-bold">{stats?.totalVerbsLearned || 0}/120</p>
            </div>
            <Award className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Score</p>
              <p className="text-2xl font-bold">{stats?.averageTestScore || 0}%</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Course Progress</span>
          <span className="text-sm font-medium text-primary-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Started</span>
          <span>120 Verbs</span>
        </div>
      </div>

      {/* Today's Action */}
      <div className="card bg-primary-50 border-primary-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">
              {isTestDay ? '📝 Test Day!' : "Today's Lesson"}
            </h3>
            <p className="text-gray-600 text-sm">
              {isTestDay 
                ? `Day ${currentDay} — Weekly test of ${currentDay === 7 ? 30 : currentDay === 14 ? 60 : currentDay === 21 ? 90 : 'all 120'} verbs`
                : `Learn 5 new verbs and complete daily tasks`}
            </p>
          </div>
          <Link
            to={isTestDay ? `/test/${currentDay}` : '/lesson'}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            {isTestDay ? 'Start Test' : 'Start Lesson'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Weak Verbs */}
      {weakVerbs.length > 0 && (
        <div className="card border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900">Weak Verbs to Revise</h4>
              <p className="text-sm text-gray-600 mb-2">
                These verbs need more practice:
              </p>
              <div className="flex flex-wrap gap-2">
                {weakVerbs.slice(0, 5).map((v) => (
                  <span key={v.verbId} className="px-3 py-1 bg-white rounded-full text-sm border border-red-200">
                    {v.verbName}
                  </span>
                ))}
                {weakVerbs.length > 5 && (
                  <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-500">
                    +{weakVerbs.length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;