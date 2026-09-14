import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Calendar, Target, Trophy, ArrowRight, Sparkles } from 'lucide-react';

const Homepage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            <img src="https://res.cloudinary.com/dj13tldrc/image/upload/v1789311370/ChatGPT_Image_Sep_13_2026_08_25_34_PM.png" alt="logo" />
          </div>
          <span className="text-xl font-bold text-gray-900">Verb Challenge</span>
        </div>
        <div className="flex gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Start Free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Join 10,000+ learners
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              30 Days.
              <br />
              <span className="text-primary-600">120 Verbs.</span>
              <br />
              Real Confidence.
            </h1>
            
            <p className="text-lg text-gray-600 max-w-xl">
              Roz sirf 5 verbs seekho, practice karo, test do aur apni English vocabulary ko strong banao.
            </p>

            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary text-lg flex items-center gap-2">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link to="/register" className="btn-primary text-lg flex items-center gap-2">
                  Start 30-Day Challenge
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              <Link to="#how-it-works" className="btn-secondary text-lg">
                How It Works
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-primary-200 border-2 border-white flex items-center justify-center text-primary-700 font-semibold text-sm">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="font-semibold text-gray-900">1,000+ Active Learners</p>
                <p className="text-sm text-gray-500">Building vocabulary daily</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Today's Progress</span>
                  <span className="text-sm font-medium text-primary-600">Day 12/30</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-primary-600 h-3 rounded-full" style={{ width: '40%' }} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-primary-50 rounded-lg">
                    <p className="text-2xl font-bold text-primary-700">5</p>
                    <p className="text-xs text-gray-600">Today's Verbs</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">12</p>
                    <p className="text-xs text-gray-600">Day Streak</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-700">60</p>
                    <p className="text-xs text-gray-600">XP Earned</p>
                  </div>
                </div>
                <button className="w-full btn-primary flex items-center justify-center gap-2">
                  Continue Learning
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div id="how-it-works" className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          <p className="text-gray-600 mt-2">A structured approach to mastering verbs</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-primary-600" />
            </div>
            <h3 className="font-semibold text-lg">Learn</h3>
            <p className="text-sm text-gray-600 mt-1">5 new verbs daily with examples</p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg">Practice</h3>
            <p className="text-sm text-gray-600 mt-1">Active recall exercises</p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg">Test</h3>
            <p className="text-sm text-gray-600 mt-1">Weekly tests to reinforce</p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="font-semibold text-lg">Master</h3>
            <p className="text-sm text-gray-600 mt-1">Track progress & earn badges</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <p className="text-4xl font-bold">120</p>
              <p className="text-primary-100 mt-1">Common Verbs</p>
            </div>
            <div>
              <p className="text-4xl font-bold">30</p>
              <p className="text-primary-100 mt-1">Days to Mastery</p>
            </div>
            <div>
              <p className="text-4xl font-bold">100%</p>
              <p className="text-primary-100 mt-1">Interactive Learning</p>
            </div>
            <div>
              <p className="text-4xl font-bold">🎯</p>
              <p className="text-primary-100 mt-1">Active Recall Method</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Ready to Master English Verbs?</h2>
        <p className="text-gray-600 mt-2 mb-8">Join thousands of learners and start your 30-day journey today</p>
        {isAuthenticated ? (
          <Link to="/dashboard" className="btn-primary text-lg px-10 py-4">
            Continue Learning
          </Link>
        ) : (
          <Link to="/register" className="btn-primary text-lg px-10 py-4">
            Start Your Free Trial
          </Link>
        )}
      </div>
    </div>
  );
};

export default Homepage;