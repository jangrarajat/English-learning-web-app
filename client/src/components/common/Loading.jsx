import React from 'react';

const Loading = ({ 
  size = 'md', 
  color = 'primary', 
  text = null, 
  fullScreen = false,
  className = '' 
}) => {
  // ==================== Size Configurations ====================
  const sizes = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-4'
  };

  // ==================== Color Configurations ====================
  const colors = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-600',
    green: 'border-green-600',
    red: 'border-red-600',
    blue: 'border-blue-600',
    purple: 'border-purple-600',
    yellow: 'border-yellow-500'
  };

  // ==================== Text Sizes ====================
  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  // ==================== Full Screen Variant ====================
  if (fullScreen) {
    return (
      <div className={`fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`${sizes[size]} ${colors[color]} border-t-transparent rounded-full animate-spin`} />
          {text && (
            <p className={`text-gray-600 font-medium ${textSizes[size] || textSizes.md}`}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ==================== Inline Variant ====================
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`${sizes[size]} ${colors[color]} border-t-transparent rounded-full animate-spin`} />
      {text && (
        <p className={`text-gray-600 font-medium ${textSizes[size] || textSizes.md}`}>
          {text}
        </p>
      )}
    </div>
  );
};

// ==================== Skeleton Loader ====================
export const SkeletonLoader = ({ 
  count = 1, 
  height = 'h-4', 
  width = 'w-full',
  className = '' 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`${height} ${width} bg-gray-200 rounded animate-pulse`}
        />
      ))}
    </div>
  );
};

// ==================== Card Skeleton ====================
export const CardSkeleton = ({ className = '' }) => {
  return (
    <div className={`card animate-pulse ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-6 bg-gray-200 rounded w-16" />
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
};

// ==================== List Skeleton ====================
export const ListSkeleton = ({ count = 5, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="card animate-pulse flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="w-16 h-6 bg-gray-200 rounded flex-shrink-0" />
        </div>
      ))}
    </div>
  );
};

// ==================== Stats Skeleton ====================
export const StatsSkeleton = ({ count = 4, className = '' }) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

// ==================== Dashboard Skeleton ====================
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>

      {/* Today's Task Card */}
      <div className="card bg-gray-100 h-32" />

      {/* Stats Grid */}
      <StatsSkeleton />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
};

// ==================== Verb Card Skeleton ====================
export const VerbCardSkeleton = ({ className = '' }) => {
  return (
    <div className={`card animate-pulse ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-24" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-20" />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="h-16 bg-gray-200 rounded-lg" />
        <div className="h-16 bg-gray-200 rounded-lg" />
        <div className="h-16 bg-gray-200 rounded-lg" />
      </div>

      <div className="h-16 bg-gray-200 rounded-lg mb-4" />

      <div className="space-y-2">
        <div className="h-12 bg-gray-200 rounded-lg" />
        <div className="h-12 bg-gray-200 rounded-lg" />
        <div className="h-12 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
};

// ==================== Full Page Loader ====================
export const PageLoader = ({ text = 'Loading...', className = '' }) => {
  return (
    <div className={`min-h-[60vh] flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">{text}</p>
      </div>
    </div>
  );
};

// ==================== Button Loader ====================
export const ButtonLoader = ({ size = 'sm', color = 'white' }) => {
  const sizes = {
    xs: 'w-3 h-3 border',
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2'
  };

  const colors = {
    white: 'border-white',
    primary: 'border-primary-600',
    gray: 'border-gray-600'
  };

  return (
    <div className={`${sizes[size]} ${colors[color]} border-t-transparent rounded-full animate-spin`} />
  );
};

// ==================== Progress Loader ====================
export const ProgressLoader = ({ value = 0, text = null }) => {
  return (
    <div className="w-full">
      {text && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{text}</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
};

// ==================== Dots Loader ====================
export const DotsLoader = ({ color = 'primary', className = '' }) => {
  const colors = {
    primary: 'bg-primary-600',
    gray: 'bg-gray-600',
    white: 'bg-white'
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 ${colors[color]} rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
};

// ==================== Pulse Loader ====================
export const PulseLoader = ({ color = 'primary', className = '' }) => {
  const colors = {
    primary: 'bg-primary-600',
    gray: 'bg-gray-600',
    green: 'bg-green-600',
    red: 'bg-red-600'
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`w-12 h-12 ${colors[color]} rounded-full animate-ping absolute opacity-75`} />
      <div className={`w-12 h-12 ${colors[color]} rounded-full relative`} />
    </div>
  );
};

// ==================== Export Default ====================
export default Loading;