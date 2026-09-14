import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  TrendingUp,
  Clock,
  BookOpen,
  Star,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getStats } from '../api/progress';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getStats();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleSave = async () => {
    // In a real app, you'd call an API to update user
    // For now, just update local state
    setUser({ ...user, name: formData.name });
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const levelNames = [
    'Beginner',
    'Learner',
    'Explorer',
    'Builder',
    'Speaker',
    'Verb Master'
  ];

  const getLevelName = (level) => {
    return levelNames[Math.min(level - 1, levelNames.length - 1)] || 'Master';
  };

  const level = user?.level || 1;
  const levelName = getLevelName(level);
  const xpProgress = ((user?.xp || 0) % 200) / 200 * 100;
  const xpForNext = 200 - ((user?.xp || 0) % 200);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account and view statistics</p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-3xl font-bold text-primary-600 flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="input-label">Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Email</label>
                  <input
                    type="email"
                    className="input-field bg-gray-50"
                    value={formData.email}
                    disabled
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => {
                    setIsEditing(false);
                    setFormData({ name: user?.name || '', email: user?.email || '' });
                  }}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <Mail className="w-4 h-4" />
                      <span>{user?.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">Level {level}</span>
                    <span className="text-gray-500">- {levelName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">{user?.xp || 0} XP</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Level {level} Progress</span>
          <span className="text-sm font-medium text-primary-600">
            {Math.round(xpProgress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-primary-400 to-primary-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Level {level}</span>
          <span>{xpForNext} XP to Level {level + 1}</span>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <BookOpen className="w-6 h-6 text-primary-500" />
          </div>
          <p className="text-2xl font-bold">{stats?.learnedVerbs || 0}</p>
          <p className="text-sm text-gray-500">Verbs Learned</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold">{stats?.masteredVerbs || 0}</p>
          <p className="text-sm text-gray-500">Verbs Mastered</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-2xl font-bold">{stats?.averageScore || 0}%</p>
          <p className="text-sm text-gray-500">Avg Test Score</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-2xl font-bold">{stats?.daysCompleted || 0}</p>
          <p className="text-sm text-gray-500">Days Completed</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <Award className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-2xl font-bold">{stats?.testsCompleted || 0}</p>
          <p className="text-sm text-gray-500">Tests Completed</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">🔥 {stats?.streak || 0}</p>
          <p className="text-sm text-gray-500">Day Streak</p>
        </div>
      </div>

      {/* Account Actions */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">Account Settings</h3>
        <div className="space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-white transition-colors flex items-center justify-between">
            <span className="text-gray-700">Change Password</span>
            <span className="text-sm text-gray-400">Coming soon</span>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-white transition-colors flex items-center justify-between">
            <span className="text-gray-700">Export Progress</span>
            <span className="text-sm text-gray-400">Coming soon</span>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-white transition-colors flex items-center justify-between text-red-600">
            <span>Delete Account</span>
            <span className="text-sm text-red-400">Coming soon</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;