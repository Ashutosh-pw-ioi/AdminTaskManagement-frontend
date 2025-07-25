"use client";
import React, { useMemo } from "react";
import EmptyList from "../EmptyList";
import SimpleTable from "../../Table/SimpleTable";
import LoadingState from "./utils/LoadingState";
import ErrorState from "./utils/ErrorState";
import TaskHeader from "./utils/TaskHeader";
import { useTaskManagement } from "./utils/useTaskManagement";
import { getTaskDropdownConfig, findChangedTasks } from "./utils/taskUtils";

// Add this date formatting function
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const DefaultTasksSection: React.FC = () => {
  const {
    tasks,
    originalTasks,
    loading,
    error,
    fetchTasks,
    handleEdit,
    handleBulkUpdate,
  } = useTaskManagement();

  const dropdownConfig = useMemo(() => getTaskDropdownConfig(), []);

  const hasChanges = useMemo(() => {
    return findChangedTasks(tasks, originalTasks).length > 0;
  }, [tasks, originalTasks]);

  // Format the tasks data with formatted taskDate
  const formattedTasks = useMemo(() => {
    return tasks.map(task => ({
      ...task,
      taskDate: task.taskDate ? formatDate(task.taskDate) : 'No date'
    }));
  }, [tasks]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-3xl font-bold mb-8 text-gray-900">
          Daily Tasks Management
        </div>
        <LoadingState message="Loading tasks..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-3xl font-bold mb-8 text-gray-900">
          Daily Tasks Management
        </div>
        <ErrorState error={error} onRetry={fetchTasks} />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="min-h-screen">
        <EmptyList taskType="daily" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="w-full max-w-7xl mx-auto">
        <TaskHeader
          title="Daily Tasks Management"
          onBulkUpdate={handleBulkUpdate}
          onRefresh={fetchTasks}
          hasChanges={hasChanges}
        />

        <div className="bg-white rounded-lg shadow-sm border">
          <SimpleTable
            data={formattedTasks} // Use formatted tasks instead of original tasks
            searchFields={["title", "description"]}
            itemsPerPage={10}
            badgeFields={["priority", "assigned_by"]}
            arrayFields={["assigned_by"]}
            dropdownFields={dropdownConfig}
            onEdit={handleEdit as (item: unknown) => void}
            editableFields={["status"]}
          />
        </div>
      </div>
    </div>
  );
};

export default DefaultTasksSection;