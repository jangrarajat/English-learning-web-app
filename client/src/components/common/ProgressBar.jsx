import React from 'react';

const ProgressBar = ({
  value,
  max = 100,
  showLabel = true,
  label,
  color = 'primary',
  size = 'md',
  className = ''
}) => {
  const percentage = Math.round((value / max) * 100);

  const colors = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600',
    purple: 'bg-purple-600'
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          <span className="text-sm font-medium text-gray-500">{percentage}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`
            ${colors[color]} 
            ${sizes[size]}
            rounded-full transition-all duration-500 ease-out
          `}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;