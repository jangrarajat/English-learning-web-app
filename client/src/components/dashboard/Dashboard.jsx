import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  BookOpen, 
  Award, 
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Calendar,
  Target,
  Flame,
  RefreshCw,
  ChevronRight,
  Zap,
  Star,
  Lock,
  Play
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStats, getWeakVerbs, getAchievements } from '../../api/progress';
import { getCurrentDay } from '../../api/course';
import { getDayVerbs } from '../../api/verbs';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';
import StreakCard from './StreakCard';
import ProgressCard from './ProgressCard';
import TodayTasks from './TodayTasks';
import StatsGrid from './StatsGrid';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [weakVerbs, setWeakVerbs] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [todayData, setTodayData] = useState(null);
  const [todayVerbs, setTodayVerbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // ==================== Data Fetching ====================
  const fetchDashboardData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      const [statsRes, weakRes, courseRes, achievementsRes] = await Promise.all([
        getStats(),
        getWeakVerbs(),
        getCurrentDay(),
        getAchievements()
      ]);

      setStats(statsRes.data);
      setWeakVerbs(weakRes.data || []);
      setTodayData(courseRes.data);
      setAchievements(achievementsRes.data || []);

      // Fetch today's verbs if it's a learning day
      if (!courseRes.data.isTestDay && !courseRes.data.dayCompleted) {
        try {
          const verbsRes = await getDayVerbs(courseRes.data.currentDay);
          setTodayVerbs(verbsRes.data || []);
        } catch (err) {
          console.warn("Could not fetch today's verbs:", err);
          setTodayVerbs([]);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ==================== Handlers ====================
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(false);
    toast.success('Dashboard refreshed!');
  };

  // ==================== Helper Functions ====================
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getDayType = () => {
    if (todayData?.isTestDay) return 'Test Day';
    if (todayData?.dayCompleted) return 'Completed ✅';
    return 'Learning Day';
  };

  const getMotivationalMessage = () => {
    const learned = stats?.learnedVerbs || 0;
    const streak = stats?.streak || 0;

    if (learned === 0) return 'Chalo shuru karte hain! 🚀';
    if (learned < 30) return `Bas ${30 - learned} verbs aur pehle milestone ke liye!`;
    if (learned === 30) return 'Great! 30 verbs complete! 🎉';
    if (learned < 60) return `Halfway there! ${120 - learned} verbs remaining!`;
    if (learned === 60) return 'Halfway done! Keep going! 🚀';
    if (learned < 90) return `Excellent progress! ${120 - learned} verbs left!`;
    if (learned < 120) return `Almost there! Only ${120 - learned} verbs left! 👑`;
    return 'All 120 verbs mastered! 🏆';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getNextMilestone = () => {
    const learned = stats?.learnedVerbs || 0;
    const milestones = [30, 60, 90, 120];
    for (const m of milestones) {
      if (learned < m) return m;
    }
    return 120;
  };

  // ==================== Loading & Error States ====================
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !stats) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Failed to Load Dashboard
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button variant="primary" onClick={() => fetchDashboardData()}>
          Retry
        </Button>
      </div>
    );
  }

  // ==================== Derived Values ====================
  const currentDay = todayData?.currentDay || 1;
  const isTestDay = todayData?.isTestDay || false;
  const dayCompleted = todayData?.dayCompleted || false;
  const verbsToday = todayVerbs.length || 5;
  const nextMilestone = getNextMilestone();

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ==================== Header ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Learner'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Day {currentDay} of 30 — {getDayType()}
          </p>
          <p className="text-sm text-primary-600 font-medium mt-1">
            {getMotivationalMessage()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-1 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Level {user?.level || 1}</span>
          </div>
        </div>
      </div>

      {/* ==================== Today's Task - Primary CTA ==================== */}
      <TodayTasks
        currentDay={currentDay}
        isTestDay={isTestDay}
        dayCompleted={dayCompleted}
        verbsToday={verbsToday}
        tasksCompleted={dayCompleted ? 5 : 0}
        totalTasks={5}
      />

      {/* ==================== Test Day Alert ==================== */}
      {isTestDay && !dayCompleted && (
        <div className="card bg-gradient-to-r from-orange-50 to-red-50 border-orange-300 animate-pulse-slow">
          <div className="flex items-center gap-4">
            <div className="text-4xl">📝</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">Test Day Alert!</h3>
              <p className="text-sm text-gray-600">
                Aaj test day hai — apne skills ko test karo aur next week unlock karo!
              </p>
            </div>
            <Link
              to={`/test/${currentDay}`}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              Take Test
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ==================== Day Completed Celebration ==================== */}
      {dayCompleted && !isTestDay && (
        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-center py-6">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-xl font-bold text-gray-900">
            Day {currentDay} Complete!
          </h3>
          <p className="text-gray-600 mt-1">
            Shabash! Kal milte hain aur 5 naye verbs ke saath! 💪
          </p>
          {currentDay < 30 && (
            <p className="text-sm text-primary-600 mt-2 font-medium">
              Next: Day {currentDay + 1} —{' '}
              {(currentDay + 1) % 7 === 0 ? 'Weekly Test' : '5 New Verbs'}
            </p>
          )}
        </div>
      )}

      {/* ==================== Main Grid ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ---------- Left Column: Stats & Progress ---------- */}
        <div className="lg:col-span-2 space-y-6">

          {/* Stats Grid */}
          <StatsGrid stats={stats} user={user} />

          {/* Course Progress */}
          <ProgressCard
            currentDay={currentDay}
            totalDays={30}
            verbsLearned={stats?.learnedVerbs || 0}
            totalVerbs={120}
            masteredVerbs={stats?.masteredVerbs || 0}
            averageScore={stats?.averageScore || 0}
          />

          {/* Today's Verbs Preview */}
          {!isTestDay && !dayCompleted && todayVerbs.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-500" />
                  Today's Verbs
                </h3>
                <Link
                  to="/lesson"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  Start Lesson
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {todayVerbs.slice(0, 5).map((verb) => (
                  <div
                    key={verb._id}
                    className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{verb.v1}</span>
                      <span className="text-xs text-gray-400">Day {verb.day}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {verb.v2} • {verb.v3}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {verb.meaning}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Tests Summary */}
          {stats?.testsCompleted > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Test Performance
                </h3>
                <Link
                  to="/progress"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Tests Completed</p>
                      <p className="text-xs text-gray-500">Keep practicing!</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">
                      {stats.testsCompleted}
                    </p>
                    <p className="text-xs text-gray-500">tests</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Average Score</p>
                      <p className="text-xs text-gray-500">Across all tests</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getScoreColor(stats.averageScore)}`}>
                      {stats.averageScore}%
                    </p>
                    <p className="text-xs text-gray-500">avg score</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Milestone Progress */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                Next Milestone
              </h3>
              <span className="text-sm font-medium text-purple-600">
                {stats?.learnedVerbs || 0}/{nextMilestone} verbs
              </span>
            </div>
            <ProgressBar
              value={stats?.learnedVerbs || 0}
              max={nextMilestone}
              color="purple"
              size="lg"
            />
            <p className="text-xs text-gray-500 mt-2">
              {nextMilestone - (stats?.learnedVerbs || 0)} more verbs to reach the next milestone!
            </p>
          </div>
        </div>

        {/* ---------- Right Column: Sidebar ---------- */}
        <div className="space-y-6">

          {/* Streak Card */}
          <StreakCard
            streak={stats?.streak || user?.streak || 0}
            lastActivityDate={user?.lastActivityDate}
          />

          {/* Weak Verbs */}
          {weakVerbs.length > 0 && (
            <div className="card border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    Weak Verbs
                    <span className="text-xs bg-red-200 text-red-700 px-2 py-0.5 rounded-full">
                      {weakVerbs.length}
                    </span>
                  </h4>
                  <p className="text-sm text-gray-600 mb-3 mt-1">
                    Practice these to improve:
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {weakVerbs.slice(0, 6).map((v) => (
                      <span
                        key={v.verbId}
                        className="px-2.5 py-1 bg-white rounded-full text-xs border border-red-200 shadow-sm font-medium"
                      >
                        {v.verbName}
                      </span>
                    ))}
                    {weakVerbs.length > 6 && (
                      <span className="px-2.5 py-1 bg-white rounded-full text-xs text-gray-500 border border-gray-200">
                        +{weakVerbs.length - 6} more
                      </span>
                    )}
                  </div>
                  <Link
                    to="/progress"
                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    Practice Now
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Achievements Preview */}
          {achievements.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  Achievements
                </h4>
                <Link
                  to="/achievements"
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {achievements.slice(0, 6).map((achievement, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center p-2 bg-yellow-50 rounded-lg border border-yellow-200"
                    title={achievement.name}
                  >
                    <span className="text-2xl">{achievement.icon || '🏅'}</span>
                    <span className="text-[10px] text-gray-600 text-center mt-1 line-clamp-2">
                      {achievement.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* XP Progress */}
          {user && (
            <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-indigo-600" />
                <h4 className="font-semibold text-gray-900">XP Progress</h4>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-indigo-600">
                  {user.xp || 0}
                </span>
                <span className="text-sm text-gray-600">XP total</span>
              </div>
              <div className="w-full bg-white/60 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(((user.xp || 0) % 200) / 200 * 100, 100)}%`
                  }}
                />
              </div>
              <p className="text-xs text-gray-600">
                {200 - ((user.xp || 0) % 200)} XP to Level {(user.level || 1) + 1}
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <Link
                to="/lesson"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Today's Lesson</p>
                  <p className="text-xs text-gray-500">Learn 5 new verbs</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                to="/verbs"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Verb Library</p>
                  <p className="text-xs text-gray-500">Browse all 120 verbs</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                to="/progress"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">View Progress</p>
                  <p className="text-xs text-gray-500">Track your journey</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                to="/achievements"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Achievements</p>
                  <p className="text-xs text-gray-500">
                    {achievements.length} badges earned
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== Footer Info ==================== */}
      <div className="card bg-gray-50 border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Course Day: {currentDay}/30
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last activity: {user?.lastActivityDate
                ? new Date(user.lastActivityDate).toLocaleDateString()
                : 'Never'}
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              Streak: {stats?.streak || 0} days
            </span>
          </div>
          <span className="text-gray-400">
            Tip: Roz practice karo, weak verbs ko strong banao! 💪
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;