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
    <div className="flex justify-between items-center mb-8">
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
          className="px-4 py-2 bg-green-600 text-white rounded font-medium 
                   hover:bg-green-700 focus:outline-none focus:ring-2 
                   focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default TaskHeader;