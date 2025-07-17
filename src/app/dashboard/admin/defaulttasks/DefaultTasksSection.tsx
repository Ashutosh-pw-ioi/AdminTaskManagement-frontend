"use client";
import React, { useState, useEffect } from "react";
import EmptyList from "../EmptyList";
import { Plus } from "lucide-react";
import SimpleTable from "../../Table/SimpleTable";
import AddTaskModal from "./AddTaskModal";
import { useAuth } from "@/src/app/contexts/AuthProvider";

// Define the task type based on your backend response
interface Task {
  id: number;
  title: string;
  description: string;
  adminId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Define the display type for the table (only fields we want to show)
interface DisplayTask {
  id: number;
  title: string;
  description: string;
}

export default function DefaultTasksSection() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModal, setIsAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  function enforceDescription(task: any): Task {
    return {
      ...task,
      description: task.description ?? "No description provided.",
    };
  }

  // Helper function to filter tasks for display
  const prepareTasksForDisplay = (tasks: Task[]): DisplayTask[] => {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description
    }));
  };

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/admin/getDefaultTasks', {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        const tasksWithDescription = result.data.map((task: any) => enforceDescription(task));
        setTasks(tasksWithDescription);
      } else {
        throw new Error('Failed to fetch tasks');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (task: { title: string; description?: string }) => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/createDefault', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          title: task.title,
          description: task.description || "No description provided.",
          adminId: user?.id
        }),
      });

      const result = await response.json();
      
      // Check if task was created successfully regardless of status code
      if (result.success || (result.data && result.data.id)) {
        // Refresh the tasks list and close modal
        await fetchTasks();
        setIsAddModal(false);
        setError(null);
      } else {
        // If the response indicates failure, still refresh to check if it was actually created
        await fetchTasks();
        
        // Get the updated tasks by making a fresh fetch call to verify
        const verifyResponse = await fetch('http://localhost:8000/api/admin/getDefaultTasks', {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        
        if (verifyResponse.ok) {
          const verifyResult = await verifyResponse.json();
          const taskExists = verifyResult.data?.some((t: any) => t.title === task.title);
          
          if (taskExists) {
            setIsAddModal(false);
            setError(null);
          } else {
            throw new Error(result.message || 'Failed to add task');
          }
        } else {
          throw new Error(result.message || 'Failed to add task');
        }
      }
    } catch (err) {
      console.error('Error adding task:', err);
      
      // Always refresh the list in case the task was created despite the error
      await fetchTasks();
      
      // Make one final verification call
      try {
        const verifyResponse = await fetch('http://localhost:8000/api/admin/getDefaultTasks', {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        
        if (verifyResponse.ok) {
          const verifyResult = await verifyResponse.json();
          const taskExists = verifyResult.data?.some((t: any) => t.title === task.title);
          
          if (taskExists) {
            setIsAddModal(false);
            setError(null);
            return; // Exit early if task was actually created
          }
        }
      } catch (verifyErr) {
        console.error('Error verifying task creation:', verifyErr);
      }
      
      // If we get here, the task was not created
      setError(err instanceof Error ? err.message : 'Failed to add task');
    }
  };

  const handleAddClick = () => {
    setIsAddModal(true);
  };

  const handleEdit = async (updatedTask: DisplayTask) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/updateDefaultTask/${updatedTask.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          title: updatedTask.title,
          description: updatedTask.description,
        }),
      });

      const result = await response.json();
      
      if (result.success || response.ok) {
        // Refresh the tasks list
        await fetchTasks();
      } else {
        throw new Error(result.message || 'Failed to update task');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      
      // Refresh the list to check if update actually worked
      await fetchTasks();
      
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/deleteDefaultTask/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      const result = await response.json();
      
      if (result.success || response.ok) {
        // Refresh the tasks list
        await fetchTasks();
      } else {
        throw new Error(result.message || 'Failed to delete task');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      
      // Refresh the list to check if deletion actually worked
      await fetchTasks();
      
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

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
            onClick={fetchTasks}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare display data
  const displayTasks = prepareTasksForDisplay(tasks);

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