"use client";
import React, { useState, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import EmptyList from "../EmptyList";
import SimpleTable from "../../Table/SimpleTable";
import AddTaskModal from "./AddTaskModal";

// Import all utilities from the createutils folder
import {
  useDailyTasks,
  transformTaskForTable,
  createHandleAddTask,
  createHandleEdit,
  createHandleDelete,
  createHandleTableEdit,
} from "./dailyTaskUtils";

export default function DailyTaskSection() {
  const {
    tasks,
    isLoading,
    error,
    setTasks,
    setError,
    refreshTasks
  } = useDailyTasks();

  const [isAddModal, setIsAddModal] = useState(false);

  // Create handlers using the factory functions
  const handleAddTask = useCallback(
    createHandleAddTask(refreshTasks, setError, setIsAddModal),
    [refreshTasks, setError]
  );

  const handleEdit = useCallback(
    createHandleEdit(refreshTasks, setError),
    [refreshTasks, setError]
  );

  const handleDelete = useCallback(
    createHandleDelete(setTasks, setError, refreshTasks),
    [setTasks, setError, refreshTasks]
  );

  const handleTableEdit = useCallback(
    createHandleTableEdit(tasks, handleEdit),
    [tasks, handleEdit]
  );

  const handleAddClick = useCallback(() => {
    setIsAddModal(true);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    refreshTasks();
  }, [refreshTasks, setError]);

  // Transform tasks for table display
  const tableData = useMemo(() => 
    tasks.map(transformTaskForTable), 
    [tasks]
  );

  if (isLoading && tasks.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-lg">Loading daily tasks...</div>
      </div>
    );
  }

  return (
    <div className="p-4 relative">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={handleRetry} 
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {isAddModal && (
        <AddTaskModal
          isOpen={isAddModal}
          onClose={() => setIsAddModal(false)}
          onSubmit={handleAddTask}
        />
      )}

      <button
        className="fixed top-6 right-6 w-10 h-10 bg-[#1B3A6A] rounded-full flex items-center justify-center mb-4 cursor-pointer shadow-xl"
        onClick={handleAddClick}
      >
        <Plus className="w-5 h-5 text-[#D4E3F5]" />
      </button>

      {tasks.length > 0 ? (
        <div className="w-full">
          <div className="text-3xl font-bold mb-8">Daily Tasks Management</div>
          
          <SimpleTable
            data={tableData}
            onEdit={handleTableEdit}
            onDelete={handleDelete}
            searchFields={["title", "description"]}
            itemsPerPage={4}
            badgeFields={["assigned_to", "status", "priority"]}
            arrayFields={["assigned_to"]}
          />
        </div>
      ) : (
        <div className="h-screen">
          <EmptyList taskType="daily" />
        </div>
      )}
    </div>
  );
}