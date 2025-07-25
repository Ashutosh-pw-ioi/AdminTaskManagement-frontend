import React from 'react';

interface TaskHeaderProps {
  title: string;
  onBulkUpdate: () => Promise<void>;
  onRefresh: () => Promise<void>;
  hasChanges?: boolean;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({
  title,
  onBulkUpdate,
  onRefresh,
  hasChanges = false
}) => {
  return (
    <div className="mb-6 sm:mb-8">
      {/* Mobile: Title stacked, buttons in same line */}
      <div className="flex flex-col space-y-4 sm:hidden">
        <h1 className="text-2xl font-bold text-gray-900 text-center mt-12 sm:mt-0 ">{title}</h1>
        <div className="flex gap-2 px-4 sm:px-0">
          <button
            onClick={onBulkUpdate}
            disabled={!hasChanges}
            className={`flex-1 px-3 py-3 rounded-lg font-medium transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm ${
              hasChanges
                ? 'bg-blue-600 text-[#1B3A6A] hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800'
                : 'bg-gray-300 text-[#1B3A6A]  cursor-not-allowed'
            }`}
            title={hasChanges ? 'Update changed tasks' : 'No changes to update'}
          >
            Update Status
          </button>
          <button
            onClick={onRefresh}
            className="flex-1 px-3 py-3 bg-[#1B3A6A] text-white rounded-lg font-medium
                        focus:outline-none focus:ring-2
                        focus:ring-offset-2 transition-colors duration-200
                        text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tablet: Horizontal with smaller buttons */}
      <div className="hidden sm:flex md:hidden justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="flex gap-2">
          <button
            onClick={onBulkUpdate}
            disabled={!hasChanges}
            className={`px-3 py-2 rounded-md font-medium transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm ${
              hasChanges
                ? ' bg-[#1B3A6A] hover:bg-blue-700 focus:ring-blue-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={hasChanges ? 'Update changed tasks' : 'No changes to update'}
          >
            Update Status
          </button>
          <button
            onClick={onRefresh}
            className="px-3 py-2 bg-[#1B3A6A] text-white rounded-md font-medium
                       hover:bg-green-700 focus:outline-none focus:ring-2
                       focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200
                       text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Desktop: Original layout */}
      <div className="hidden md:flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <div className="flex gap-3">
          <button
            onClick={onBulkUpdate}
            disabled={!hasChanges}
            className={`px-4 py-2 rounded font-medium transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={hasChanges ? 'Update changed tasks' : 'No changes to update'}
          >
            Update Status
          </button>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-[#1B3A6A] text-white rounded font-medium
                       hover:bg-green-700 focus:outline-none focus:ring-2
                       focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskHeader;