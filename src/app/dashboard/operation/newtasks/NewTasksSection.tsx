"use client";
import React, { useMemo } from "react";
import EmptyList from "../EmptyList";
import LoadingState from "../dailytasks/utils/LoadingState";
import ErrorState from "../dailytasks/utils/ErrorState";
import TaskHeader from "../dailytasks/utils/TaskHeader";
import TaskSection from "./utils/TaskSection";
import { useNewTaskManagement } from "./utils/useNewTaskManagement";
import { getNewTaskTableProps } from "./utils/newTaskUtils";

// Add this date formatting function
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const NewTasksSection: React.FC = () => {
  const {
    taskCategories,
    loading,
    error,
    collapsibleState,
    fetchTasks,
    handleEdit,
    handleBulkUpdate,
    toggleCollapsible,
    hasChanges,
  } = useNewTaskManagement();

  const tableProps = getNewTaskTableProps();

  // Format tasks with formatted due_date
  const formattedTaskCategories = useMemo(() => {
    const formatTaskArray = (tasks: any[]) => 
      tasks.map(task => ({
        ...task,
        due_date: task.due_date ? formatDate(task.due_date) : 'No due date'
      }));

    return {
      upcoming: formatTaskArray(taskCategories.upcoming),
      overdue: formatTaskArray(taskCategories.overdue),
      completed: formatTaskArray(taskCategories.completed),
    };
  }, [taskCategories]);

  // Loading state
  if (loading) {
    return (
      <div className="p-4">
        <div className="text-3xl font-bold mb-8 text-gray-900">
          New Tasks Management
        </div>
        <LoadingState message="Loading new tasks..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4">
        <div className="text-3xl font-bold mb-8 text-gray-900">
          New Tasks Management
        </div>
        <ErrorState error={error} onRetry={fetchTasks} />
      </div>
    );
  }

  // Check if there are any tasks
  const totalTasks =
    taskCategories.upcoming.length +
    taskCategories.overdue.length +
    taskCategories.completed.length;

  // Empty state
  if (totalTasks === 0) {
    return (
      <div className="min-h-screen">
        <EmptyList taskType="new" />
      </div>
    );
  }

  // Main content
  return (
    <div className="p-4">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <TaskHeader
          title="New Tasks Management"
          onBulkUpdate={handleBulkUpdate}
          onRefresh={fetchTasks}
          hasChanges={hasChanges}
        />

        {/* Upcoming Tasks */}
        <TaskSection
          title="Upcoming Tasks"
          tasks={formattedTaskCategories.upcoming}
          count={taskCategories.upcoming.length}
          bgColor="bg-green-50"
          borderColor="border-green-200"
          textColor="text-green-800"
          emptyMessage="No upcoming tasks"
          tableProps={tableProps}
          onEdit={handleEdit}
        />

        {/* Overdue Tasks */}
        <TaskSection
          title="Overdue Tasks"
          tasks={formattedTaskCategories.overdue}
          count={taskCategories.overdue.length}
          bgColor="bg-red-50"
          borderColor="border-red-200"
          textColor="text-red-800"
          emptyMessage="No overdue tasks"
          isCollapsible={true}
          isCollapsed={collapsibleState.overdue}
          onToggleCollapse={() => toggleCollapsible('overdue')}
          tableProps={tableProps}
          onEdit={handleEdit}
        />

        {/* Completed Tasks */}
        <TaskSection
          title="Completed Tasks"
          tasks={formattedTaskCategories.completed}
          count={taskCategories.completed.length}
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
          textColor="text-blue-800"
          emptyMessage="No completed tasks"
          isCollapsible={true}
          isCollapsed={collapsibleState.completed}
          onToggleCollapse={() => toggleCollapsible('completed')}
          tableProps={tableProps}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
};

export default NewTasksSection;