import React from 'react';

interface PageLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] w-full">
      <div
        className={`${sizeClasses[size]} border-gray-300 border-t-blue-600 rounded-full animate-spin`}
      />
      {text && (
        <p className="mt-4 text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
};

export default PageLoader;
