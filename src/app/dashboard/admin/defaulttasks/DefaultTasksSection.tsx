"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import EmptyList from "../EmptyList";
import { Plus } from "lucide-react";
import SimpleTable from "../../Table/SimpleTable";
import AddTaskModal from "./AddTaskModal";
import { useAuth } from "@/src/app/contexts/AuthProvider";

// Import types and utilities
import { Task, TableItem } from "./defaultTaskUtils/types";
import { prepareTasksForDisplay } from "./defaultTaskUtils/taskUtils";
import { RequestTracker, fetchTasks, createTask, updateTask, deleteTask } from "./defaultTaskUtils/taskApi";
import { invalidateCache } from "./defaultTaskUtils/taskCache";

export default function DefaultTasksSection() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModal, setIsAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const requestTracker = useRef(new RequestTracker());

  const loadTasks = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const tasksData = await fetchTasks(requestTracker.current, forceRefresh);
      setTasks(tasksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks().catch(() => {});
  }, [loadTasks]);

  const handleAddTask = useCallback(async (task: { title: string; description?: string }) => {
    try {
      await createTask(requestTracker.current, task, user?.id);
      await loadTasks(true);
      setIsAddModal(false);
      setError(null);
    } catch (err) {
      await loadTasks(true);
      setError(err instanceof Error ? err.message : 'Failed to add task');
    }
  }, [user?.id, loadTasks]);

  const handleAddClick = useCallback(() => {
    setIsAddModal(true);
  }, []);

  const handleEdit = useCallback(async (item: TableItem) => {
    try {
      await updateTask(requestTracker.current, item);
      await loadTasks(true);
    } catch (err) {
      await loadTasks(true);
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  }, [loadTasks]);

  const handleDelete = useCallback(async (id: number | string) => {
    try {
      await deleteTask(requestTracker.current, id, tasks);
      await loadTasks(true);
      setError(null);
    } catch (err) {
      await loadTasks(true);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  }, [tasks, loadTasks]);

  const handleRetry = useCallback(() => {
    invalidateCache();
    loadTasks(true);
  }, [loadTasks]);

  const displayTasks = useMemo(() => prepareTasksForDisplay(tasks), [tasks]);

  if (loading) {
    return (
      <div className="p-4 h-screen relative flex items-center justify-center">
        <div className="text-lg">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 h-screen relative">
        <div className="text-red-500 text-center">
          <p>Error: {error}</p>
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
        className="fixed top-6 right-6 w-10 h-10 bg-[#1B3A6A] rounded-full flex items-center justify-center mb-4 cursor-pointer shadow-xl"
        onClick={handleAddClick}
      >
        <Plus className="w-5 h-5 text-[#D4E3F5]" />
      </button>

      {tasks.length > 0 ? (
        <div className="w-full">
          <div className="text-3xl font-bold mb-8">
            Default Tasks Management
          </div>
          <SimpleTable
            data={displayTasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchFields={["title", "description"]}
            itemsPerPage={6}
          />
        </div>
      ) : (
        <EmptyList taskType={"default"} />
      )}
    </div>
  );
}