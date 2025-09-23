
import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Finding the perfect recipe..." }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-emerald-500"></div>
      <p className="text-lg text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
};
