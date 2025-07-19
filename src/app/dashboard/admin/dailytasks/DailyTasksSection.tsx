"use client";
import React, { useState, useEffect } from "react";
import EmptyList from "../EmptyList";
import { Plus } from "lucide-react";
import SimpleTable from "../../Table/SimpleTable";
import AddTaskModal from "./AddTaskModal";

const API_BASE_URL = "http://localhost:8000/api/admin";

export default function DefaultTasksSection() {
  const [tasks, setTasks] = useState([]);
  const [isAddModal, setIsAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/getTodayDailyTasks`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Transform backend data to match frontend format
        const transformedTasks = data.data.map((task) => ({
          id: task.id,
          title: task.defaultTask.title,
          description: task.defaultTask.description || "No description provided.",
          priority: task.priority,
          status: task.status,
          assigned_to: task.operators.map(operator => operator.name),
          // Keep these fields for API operations but hide from UI
          defaultTaskId: task.defaultTaskId,
          operatorIds: task.operators.map(operator => operator.id),
          isCompleted: task.isCompleted,
          taskDate: task.taskDate,
        }));
        setTasks(transformedTasks);
      } else {
        throw new Error("Failed to fetch tasks");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle adding a new task
  const handleAddTask = async (task) => {
    try {
      const requestBody = {
        defaultTaskId: task.defaultTaskId, // This should be passed from the modal
        operatorIds: task.operatorIds, // This should be operator IDs, not names
        priority: task.priority,
        status: task.status,
      };

      const response = await fetch(`${API_BASE_URL}/createDailyTask`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh the tasks list
        await fetchTasks();
        setIsAddModal(false);
      } else {
        throw new Error("Failed to create task");
      }
    } catch (err) {
      console.error("Error adding task:", err);
      setError(err.message);
    }
  };

  // Handle editing a task
  const handleEdit = async (updatedTask) => {
    try {
      const requestBody = {
        priority: updatedTask.priority,
        operatorIds: updatedTask.operatorIds, // Should be operator IDs
      };

      const response = await fetch(`${API_BASE_URL}/updateDailyTask/${updatedTask.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success || response.ok) {
        // Refresh the tasks list
        await fetchTasks();
      } else {
        throw new Error("Failed to update task");
      }
    } catch (err) {
      console.error("Error updating task:", err);
      setError(err.message);
    }
  };

  // Handle deleting a task
  const handleDelete = (id: string | number) => {
    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/deleteDailyTask/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Remove the task from local state
        setTasks((prev) => prev.filter((task) => task.id !== id));
      } catch (err) {
        console.error("Error deleting task:", err);
        setError((err as Error).message);
      }
    })();
  };

  const handleAddClick = () => {
    setIsAddModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-800">
            <h3 className="font-medium">Error loading tasks</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchTasks}
          className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {isAddModal && (
        <AddTaskModal
          isOpen={isAddModal}
          onClose={() => setIsAddModal(false)}
          onSubmit={handleAddTask}
        />
      )}

      <div>
        <div>
          <div>
            <div>
              <button
                onClick={handleAddClick}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Plus size={16} />
                Add Task
              </button>
            </div>
          </div>
        </div>

        {tasks.length > 0 ? (
          <div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Daily Tasks Management</h2>
              <SimpleTable
                data={tasks.map(task => ({
                  id: task.id,
                  title: task.title,
                  description: task.description,
                  priority: task.priority,
                  status: task.status,
                  assigned_to: task.assigned_to,
                }))}
                onEdit={(item) => {
                  // Find the original task with all fields for API call
                  const originalTask = tasks.find(t => t.id === item.id);
                  handleEdit(originalTask);
                }}
                onDelete={handleDelete}
                searchFields={["title", "description"]}
                itemsPerPage={4}
                badgeFields={["assigned_to", "status", "priority"]}
                arrayFields={["assigned_to"]}
              />
            </div>
          </div>
        ) : (
          <div>
            <EmptyList
              title="No Daily Tasks"
              description="Get started by adding your first daily task."
              buttonText="Add Task"
              onButtonClick={handleAddClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}