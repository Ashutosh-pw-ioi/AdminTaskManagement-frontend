// UIComponents.tsx
import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen p-6 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading dashboard data...</p>
    </div>
  </div>
);

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
  isRetrying: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry, isRetrying }) => (
  <div className="min-h-screen p-6 flex items-center justify-center">
    <div className="text-center">
      <div className="text-red-500 mb-4">
        <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-red-600 mb-4">{error}</p>
      <div className="space-x-2">
        <button 
          onClick={onRetry}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          disabled={isRetrying}
        >
          {isRetrying ? 'Retrying...' : 'Retry'}
        </button>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Full Reload
        </button>
      </div>
    </div>
  </div>
);

interface RefreshButtonProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh, isRefreshing }) => (
  <button 
    onClick={onRefresh}
    className="bg-[#1B3A6A] text-white cursor-pointer px-4 py-2 mt-10 sm:mt-0 rounded-lg flex items-center space-x-2 disabled:opacity-50"
    disabled={isRefreshing}
  >
    <svg className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
    <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
  </button>
);