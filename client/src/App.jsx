import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// ==================== Layouts ====================
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// ==================== Pages ====================
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import DailyLesson from './pages/DailyLesson';
import TestPage from './pages/TestPage';
import ProgressPage from './pages/ProgressPage';
import VerbLibrary from './pages/VerbLibrary';
import Achievements from './pages/Achievements';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// ==================== Auth Components ====================
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// ==================== Route Guards ====================
import { ProtectedRoute, PublicRoute } from './routes';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              fontSize: '14px'
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff'
              }
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff'
              }
            }
          }}
        />
        <Routes>
          {/* ============ Homepage ============ */}
          <Route path="/" element={<Homepage />} />

          {/* ============ Auth Routes ============ */}
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
          </Route>

          {/* ============ Protected Routes ============ */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lesson" element={<DailyLesson />} />
            <Route path="/lesson/:day" element={<DailyLesson />} />
            <Route path="/test/:day" element={<TestPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/verbs" element={<VerbLibrary />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* ============ 404 ============ */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;