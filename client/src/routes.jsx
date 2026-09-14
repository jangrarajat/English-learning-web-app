import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Loading from './components/common/Loading';

// ==================== Protected Route ====================
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// ==================== Public Route ====================
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ==================== Admin Route ====================
export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ==================== Route Constants ====================
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  LESSON: '/lesson',
  TEST: '/test',
  PROGRESS: '/progress',
  VERBS: '/verbs',
  ACHIEVEMENTS: '/achievements',
  PROFILE: '/profile',
  NOT_FOUND: '/404'
};

// ==================== Navigation Items ====================
export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'Home' },
  { name: "Today's Lesson", path: ROUTES.LESSON, icon: 'BookOpen' },
  { name: 'Verb Library', path: ROUTES.VERBS, icon: 'Library' },
  { name: 'Tests', path: '/test/7', icon: 'FileText' },
  { name: 'Progress', path: ROUTES.PROGRESS, icon: 'BarChart3' },
  { name: 'Achievements', path: ROUTES.ACHIEVEMENTS, icon: 'Trophy' },
  { name: 'Profile', path: ROUTES.PROFILE, icon: 'User' }
];

// ==================== Get Route Path Helper ====================
export const getRoutePath = (routeName) => {
  const routes = {
    home: '/',
    login: '/login',
    register: '/register',
    dashboard: '/dashboard',
    lesson: '/lesson',
    lessonDay: (day) => `/lesson/${day}`,
    test: (day) => `/test/${day}`,
    progress: '/progress',
    verbs: '/verbs',
    achievements: '/achievements',
    profile: '/profile',
    notFound: '/404'
  };
  return routes[routeName] || '/';
};