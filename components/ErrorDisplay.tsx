
import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="mt-6 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-200 p-4 rounded-md shadow-md" role="alert">
      <p className="font-bold">Oops!</p>
      <p>{message}</p>
    </div>
  );
};
