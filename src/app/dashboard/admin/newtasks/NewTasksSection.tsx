"use client";
import React, { useState, useEffect } from "react";
import EmptyList from "@/src/app/dashboard/admin/EmptyList";
import { Plus } from "lucide-react";
import SimpleTable from "../../Table/SimpleTable";
import AddTaskModal from "./AddTaskModal";
import { useAuth } from "@/src/app/contexts/AuthProvider";

// API service functions
const API_BASE_URL = "http://localhost:8000/api/admin";

const taskService = {
  // Helper function to get auth headers (cookie-based auth)
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  },

  // Fetch all tasks
  async fetchTasks() {
    try {
      const response = await fetch(`${API_BASE_URL}/getNewTask`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please log in again');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      // Return the data array from your API response structure
      return result.data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Create new task
 async createTask(taskData: Task) {
    try {
        console.log("Sending POST request to create task:", taskData); // Debug log

        const response = await fetch(`${API_BASE_URL}/createNew`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(taskData),
            credentials: 'include',
        });
        
        console.log("Response status:", response.status); // Debug log
        console.log("Response headers:", response.headers); // Debug log

        // Get response text first for debugging
        const responseText = await response.text();
        console.log("Response text:", responseText); // Debug log

        // Try to parse as JSON
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (parseError) {
            console.error("Failed to parse response as JSON:", parseError);
            throw new Error(`Invalid JSON response: ${responseText}`);
        }

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            } else if (response.status === 400) {
                // Handle validation errors
                const errorMessage = responseData.error || 'Bad request';
                throw new Error(`Validation error: ${errorMessage}`);
            } else if (response.status === 500) {
                const errorMessage = responseData.error || 'Internal server error';
                throw new Error(`Server error: ${errorMessage}`);
            } else {
                throw new Error(`HTTP error! status: ${response.status} - ${responseData.error || 'Unknown error'}`);
            }
        }
        
        console.log("Parsed response data:", responseData); // Debug log
        return responseData;
        
    } catch (error) {
        console.error('Error in createTask service:', error);
        
        // Re-throw with more context
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Unknown error occurred while creating task');
        }
    }
},

  // Update task
  async updateTask(taskId: string, updateData: Task) {
    try {
      const response = await fetch(`${API_BASE_URL}/updateNewTask/${taskId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please log in again');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete task
  async deleteTask(taskId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/deleteNewTask/${taskId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please log in again');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },
};

interface Task {
  
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  status: string;
  operatorIds: string[];
  adminId: string;
}

export default function NewTasksSection() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModal, setIsAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, checkAuth } = useAuth();

  // Load tasks from backend on component mount
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadTasks();
    } else if (isAuthenticated === false) {
      // User is not authenticated
      setIsLoading(false);
      setError('Please log in to view tasks.');
    }
  }, [isAuthenticated, user?.id]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedTasks = await taskService.fetchTasks();
      
      // Transform the data to match your frontend format
      const transformedTasks = fetchedTasks.map((task: any) => ({
        ...task,
        assigned_to: task.operators ? task.operators.map((op: any) => op.id) : [], // Map operators to assigned_to
        description: task.description || "No description provided.",
      }));
      
      setTasks(transformedTasks);
    } catch (err: any) {
      console.error('Error loading tasks:', err);
      
      if (err.message.includes('Unauthorized')) {
        setError('Session expired. Please log in again.');
        // Trigger auth check to refresh token or redirect
        checkAuth();
      } else {
        setError('Failed to load tasks. Please try again.');
      }
      
      // Fallback to empty array instead of crashing
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (task: any) => {
    try {
      // Transform frontend data to match backend format
      const taskData = {
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate || new Date().toISOString().split('T')[0], // Default to today if not provided
        priority: task.priority,
        status: task.status,
        adminId: task.adminId || user?.id || "3d287755-a630-4d65-bebb-d2224e53f039", // Use user ID from context
        operatorIds: task.assigned_to || [],
      };

      const response = await taskService.createTask(taskData);
      
      // Check if response has the expected structure
      const newTask = response.data || response;
      
      // Transform back to frontend format and add to state
      const transformedTask = {
        ...newTask,
        assigned_to: newTask.operators ? newTask.operators.map((op: any) => op.id) : newTask.operatorIds || [],
      };
      
      setTasks(prev => [...prev, transformedTask]);
      setIsAddModal(false);
      setError(null); // Clear any previous errors
      
    } catch (err: any) {
      console.error('Error creating task:', err);
      
      if (err.message.includes('Unauthorized')) {
        setError('Session expired. Please log in again.');
        checkAuth();
      } else {
        setError('Failed to create task. Please try again.');
      }
    }
  };

  const handleAddClick = () => {
    if (!isAuthenticated) {
      setError('Please log in to add tasks.');
      return;
    }
    setIsAddModal(true);
  };

  const handleEdit = async (updatedTask: Task) => {
    try {
      // Transform frontend data to match backend format
      const updateData = {
        title: updatedTask.title,
        description: updatedTask.description,
        dueDate: updatedTask.dueDate,
        priority: updatedTask.priority,
        status: updatedTask.status,
        operatorIds: updatedTask.assigned_to || [],
      };

      await taskService.updateTask(updatedTask.id, updateData);
      
      // Update local state
      setTasks(prev =>
        prev.map(task => task.id === updatedTask.id ? updatedTask : task)
      );
      setError(null); // Clear any previous errors
      
    } catch (err: any) {
      console.error('Error updating task:', err);
      
      if (err.message.includes('Unauthorized')) {
        setError('Session expired. Please log in again.');
        checkAuth();
      } else {
        setError('Failed to update task. Please try again.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      
      // Update local state
      setTasks(prev => prev.filter(task => task.id !== id));
      setError(null); // Clear any previous errors
      
    } catch (err: any) {
      console.error('Error deleting task:', err);
      
      if (err.message.includes('Unauthorized')) {
        setError('Session expired. Please log in again.');
        checkAuth();
      } else {
        setError('Failed to delete task. Please try again.');
      }
    }
  };

  // Show loading state while checking authentication
  if (isLoading && !isAuthenticated) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-lg">Checking authentication...</div>
      </div>
    );
  }

  // Show authentication error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Please log in to access tasks.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-lg">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="p-4 relative">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={loadTasks} 
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
          <div className="text-3xl font-bold mb-8">New Tasks Management</div>
          <SimpleTable
            data={tasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchFields={["title", "description"]}
            itemsPerPage={4}
            badgeFields={["assigned_to", "status", "priority"]}
            arrayFields={["assigned_to"]}
          />
        </div>
      ) : (
        <div className="h-screen">
          <EmptyList taskType={"new"} />
        </div>
      )}
    </div>
  );
}