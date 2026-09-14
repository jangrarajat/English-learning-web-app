import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary-600 mb-2">404</div>
          <div className="w-24 h-1 bg-primary-600 mx-auto rounded-full"></div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Oops! Page Nahi Mila
        </h1>
        <p className="text-gray-600 mb-8">
          Lagta hai aap galat jagah aa gaye ho. Ye page exist nahi karta.
          Chalo wapas dashboard pe chalein! 🚀
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard"
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Helpful Links:</p>
          <div className="flex flex-wrap gap-3 justify-center text-sm">
            <Link to="/" className="text-primary-600 hover:text-primary-700 hover:underline">
              Home
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/lesson" className="text-primary-600 hover:text-primary-700 hover:underline">
              Today's Lesson
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/verbs" className="text-primary-600 hover:text-primary-700 hover:underline">
              Verb Library
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/progress" className="text-primary-600 hover:text-primary-700 hover:underline">
              Progress
            </Link>
          </div>
        </div>

        {/* Decorative */}
        <div className="mt-12 text-6xl">🔍</div>
      </div>
    </div>
  );
};

export default NotFound;