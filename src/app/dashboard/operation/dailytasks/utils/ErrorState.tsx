import React from 'react';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  onRetry, 
  className = "h-64" 
}) => {
  return (
    <div className={`flex flex-col justify-center items-center ${className}`}>
      <div className="text-center space-y-4">
        <div className="text-red-600 font-medium">
          Error: {error}
        </div>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     transition-colors duration-200"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;