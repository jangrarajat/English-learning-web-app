import React from 'react';

const Card = ({
  children,
  className = '',
  hover = false,
  padding = true,
  ...props
}) => {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm border border-gray-200/70
        ${padding ? 'p-6' : ''}
        ${hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-1' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;