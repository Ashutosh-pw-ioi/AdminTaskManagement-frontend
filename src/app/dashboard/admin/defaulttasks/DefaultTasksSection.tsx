"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import EmptyList from "../EmptyList";
import { Plus } from "lucide-react";
import SimpleTable from "../../Table/SimpleTable";
import AddTaskModal from "./AddTaskModal";
import { useAuth } from "@/src/app/contexts/AuthProvider";

// Import our modular components
import { TableItem, TaskState } from '@/src/app/dashboard/admin/defaulttasks/defaultTaskUtils/types';
import { TaskApi } from '@/src/app/dashboard/admin/defaulttasks/defaultTaskUtils/taskApi';
import { TaskUtils } from './defaultTaskUtils/taskUtils';
import { TaskCache } from './defaultTaskUtils/taskCache';

export default function DefaultTasksSection() {
  const [state, setState] = useState<TaskState>({
    tasks: [],
    loading: true,
    error: null
  });
  const [isAddModal, setIsAddModal] = useState(false);
  const { user } = useAuth();

  // Update state helper
  const updateState = useCallback((updates: Partial<TaskState>) => {
    setState(prevState => ({ ...prevState, ...updates }));
  }, []);

  // Fetch tasks with state management
  const fetchTasks = useCallback(async (forceRefresh = false): Promise<void> => {
    try {
      updateState({ loading: true, error: null });
      const tasks = await TaskApi.fetchTasks(forceRefresh);
      updateState({ tasks, loading: false });
    } catch (err) {
      const errorMessage = TaskUtils.getErrorMessage(err, 'Failed to fetch tasks');
      updateState({ loading: false, error: errorMessage });
    }
  }, [updateState]);

  // Initialize tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle adding a new task
  const handleAddTask = useCallback(async (task: { title: string; description?: string }) => {
    try {
      updateState({ error: null });
      
      const success = await TaskApi.createTask({
        title: task.title,
        description: task.description,
        adminId: user?.id
      });

      if (success) {
        await fetchTasks(true);
        setIsAddModal(false);
      }
    } catch (err) {
      const errorMessage = TaskUtils.getErrorMessage(err, 'Failed to add task');
      updateState({ error: errorMessage });
      // Refresh tasks to show current state
      await fetchTasks(true);
    }
  }, [user?.id, fetchTasks, updateState]);

  // Handle opening add modal
  const handleAddClick = useCallback(() => {
    setIsAddModal(true);
  }, []);

  // Handle editing a task
  const handleEdit = useCallback(async (item: TableItem) => {
    try {
      updateState({ error: null });
      
      await TaskApi.updateTask(item.id, {
        title: String(item.title),
        description: String(item.description)
      });
      
      await fetchTasks(true);
    } catch (err) {
      const errorMessage = TaskUtils.getErrorMessage(err, 'Failed to update task');
      updateState({ error: errorMessage });
      // Refresh tasks to show current state
      await fetchTasks(true);
    }
  }, [fetchTasks, updateState]);

  // Handle deleting a task
  const handleDelete = useCallback(async (id: number | string) => {
    try {
      updateState({ error: null });
      
      await TaskApi.deleteTask(id);
      await fetchTasks(true);
    } catch (err) {
      const errorMessage = TaskUtils.getErrorMessage(err, 'Failed to delete task');
      updateState({ error: errorMessage });
      // Refresh tasks to show current state
      await fetchTasks(true);
    }
  }, [fetchTasks, updateState]);

  // Prepare tasks for table display
  const displayTasks = useMemo(() => 
    TaskUtils.prepareTasksForDisplay(state.tasks), 
    [state.tasks]
  );

  // Handle retry action
  const handleRetry = useCallback(() => {
    TaskCache.invalidateCache();
    fetchTasks(true);
  }, [fetchTasks]);

  // Loading state
  if (state.loading) {
    return (
      <div className="sm:p-4 h-screen relative flex items-center justify-center">
        <div className="text-lg">Loading tasks...</div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="sm:p-4 h-screen relative">
        <div className="text-red-500 text-center">
          <p>Error: {state.error}</p>
          <button 
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="p-4 h-screen relative">
      {isAddModal && (
        <AddTaskModal
          isOpen={isAddModal}
          onClose={() => setIsAddModal(false)}
          onSubmit={handleAddTask}
        />
      )}
      
      <button
        className="fixed top-18 sm:top-6 right-6 w-10 h-10 bg-[#1B3A6A] rounded-full flex items-center justify-center mb-4 cursor-pointer shadow-xl"
        onClick={handleAddClick}
      >
        <Plus className="w-5 h-5 text-[#D4E3F5]" />
      </button>

      {state.tasks.length > 0 ? (
        <div className="w-full">
          <div className="text-3xl sm:px-0 mt-5 sm:mt-0 font-bold mb-8">
            Default Tasks Management
          </div>
          <SimpleTable
            data={displayTasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchFields={["title", "description"]}
            itemsPerPage={6}
            editableFields={["title", "description"]}
          />
        </div>
      ) : (
        <EmptyList taskType={"default"} />
      )}
    </div>
  );
}