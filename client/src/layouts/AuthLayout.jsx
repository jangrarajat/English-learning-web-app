import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                <img src="https://res.cloudinary.com/dj13tldrc/image/upload/v1789311370/ChatGPT_Image_Sep_13_2026_08_25_34_PM.png" alt="logo" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Verb Challenge</h1>
            <p className="text-gray-600 mt-1">Master 120 English Verbs in 30 Days</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;