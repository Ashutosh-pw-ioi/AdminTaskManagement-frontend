"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import EmptyList from "../EmptyList";
import { Plus } from "lucide-react";
import SimpleTable from "../../Table/SimpleTable";
import AddTaskModal from "./AddTaskModal";

const API_BASE_URL = "http://localhost:8000/api/admin";

interface Operator {
  id: string | number;
  name: string;
}

interface DefaultTask {
  title: string;
  description?: string;
}

interface TaskFromAPI {
  id: string | number;
  defaultTask: DefaultTask;
  priority: string;
  status: string;
  operators: Operator[];
  defaultTaskId: string | number;
  isCompleted: boolean;
  taskDate: string;
}

interface TransformedTask {
  id: string | number;
  title: string;
  description: string;
  priority: string;
  status: string;
  assigned_to: string[];
  defaultTaskId: string | number;
  operatorIds: (string | number)[];
  isCompleted: boolean;
  taskDate: string;
}

// Define FormTask interface to match what AddTaskModal expects
interface FormTask {
  defaultTaskId: string | number;
  operatorIds: (string | number)[];
  priority: string;
  status: string;
}

// Interface for the edited data from table
interface EditedTaskData {
  id: string | number;
  title: string;
  description: string;
  priority: string;
  status: string;
  assigned_to: string[];
}

// Status conversion utilities
const statusUtils = {
  // Convert backend status to frontend display format
  toDisplayFormat: (backendStatus: string): string => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Pending',
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed'
    };
    return statusMap[backendStatus] || backendStatus;
  },

  // Convert frontend display format to backend format
  toBackendFormat: (displayStatus: string): string => {
    const statusMap: Record<string, string> = {
      'Pending': 'PENDING',
      'In Progress': 'IN_PROGRESS',
      'Inprogress': 'IN_PROGRESS', // Handle both cases
      'Completed': 'COMPLETED'
    };
    
    // First check exact match
    if (statusMap[displayStatus]) {
      return statusMap[displayStatus];
    }
    
    // Handle case-insensitive matching and common variations
    const normalizedStatus = displayStatus.toLowerCase().trim();
    if (normalizedStatus === 'pending') return 'PENDING';
    if (normalizedStatus === 'in progress' || normalizedStatus === 'inprogress') return 'IN_PROGRESS';
    if (normalizedStatus === 'completed') return 'COMPLETED';
    
    // Fallback: convert to proper backend format with underscores
    return displayStatus.toUpperCase().replace(/\s+/g, '_');
  },

  // Get all available statuses for frontend display
  getDisplayStatuses: (): string[] => {
    return ['Pending', 'In Progress', 'Completed'];
  },

  // Get all available statuses for backend
  getBackendStatuses: (): string[] => {
    return ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
  }
};

// Priority conversion utilities
const priorityUtils = {
  // Convert backend priority to frontend display format
  toDisplayFormat: (backendPriority: string): string => {
    const priorityMap: Record<string, string> = {
      'LOW': 'Low',
      'MEDIUM': 'Medium',
      'HIGH': 'High',
     
    };
    return priorityMap[backendPriority] || backendPriority;
  },

  // Convert frontend display format to backend format
  toBackendFormat: (displayPriority: string): string => {
    const priorityMap: Record<string, string> = {
      'Low': 'LOW',
      'Medium': 'MEDIUM',
      'High': 'HIGH',
      
    };
    
    // First check exact match
    if (priorityMap[displayPriority]) {
      return priorityMap[displayPriority];
    }
    
    // Handle case-insensitive matching
    const normalizedPriority = displayPriority.toLowerCase().trim();
    if (normalizedPriority === 'low') return 'LOW';
    if (normalizedPriority === 'medium') return 'MEDIUM';
    if (normalizedPriority === 'high') return 'HIGH';
    if (normalizedPriority === 'urgent') return 'URGENT';
    if (normalizedPriority === 'critical') return 'CRITICAL';
    
    // Fallback: convert to uppercase
    return displayPriority.toUpperCase();
  },

  // Get all available priorities for frontend display
  getDisplayPriorities: (): string[] => {
    return ['Low', 'Medium', 'High', 'Urgent', 'Critical'];
  },

  // Get all available priorities for backend
  getBackendPriorities: (): string[] => {
    return ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'];
  }
};

const apiCache: {
  data: TransformedTask[] | null;
  timestamp: number | null;
  promise: Promise<TransformedTask[]> | null;
} = {
  data: null,
  timestamp: null,
  promise: null,
};

const CACHE_DURATION = 30000;

function useDailyTasks() {
  const [tasks, setTasks] = useState<TransformedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const fetchTasks = useCallback(async (forceRefresh = false) => {
    const currentRequestId = ++requestIdRef.current;

    try {
      setIsLoading(true);
      setError(null);

      if (!forceRefresh && apiCache.data && apiCache.timestamp) {
        const cacheAge = Date.now() - apiCache.timestamp;
        if (cacheAge < CACHE_DURATION) {
          setTasks(apiCache.data);
          setIsLoading(false);
          return apiCache.data;
        }
      }

      if (apiCache.promise && !forceRefresh) {
        const cachedResult = await apiCache.promise;
        if (mountedRef.current && currentRequestId === requestIdRef.current) {
          setTasks(cachedResult);
          setIsLoading(false);
        }
        return cachedResult;
      }

      const requestPromise = (async () => {
        const response = await fetch(`${API_BASE_URL}/getTodayDailyTasks`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.redirected) {
          throw new Error("Authentication may have expired. Please refresh the page.");
        }

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error("Authentication required. Please login again.");
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch tasks");
        }

        const transformedTasks = data.data.map((task: TaskFromAPI) => ({
          id: task.id,
          title: task.defaultTask.title,
          description: task.defaultTask.description || "No description provided.",
          priority: priorityUtils.toDisplayFormat(task.priority), // Convert to display format
          status: statusUtils.toDisplayFormat(task.status), // Convert to display format
          assigned_to: task.operators.map(operator => operator.name),
          defaultTaskId: task.defaultTaskId,
          operatorIds: task.operators.map(operator => operator.id),
          isCompleted: task.isCompleted,
          taskDate: task.taskDate,
        }));

        apiCache.data = transformedTasks;
        apiCache.timestamp = Date.now();
        apiCache.promise = null;

        return transformedTasks;
      })();

      apiCache.promise = requestPromise;

      const result = await requestPromise;
      
      if (mountedRef.current && currentRequestId === requestIdRef.current) {
        setTasks(result);
      }

      return result;

    } catch (err: unknown) {
      apiCache.promise = null;
      
      if (mountedRef.current && currentRequestId === requestIdRef.current) {
        setError(err instanceof Error ? err.message : String(err));
        setTasks([]);
      }
      throw err;
    } finally {
      if (mountedRef.current && currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const refreshTasks = useCallback(() => {
    apiCache.data = null;
    apiCache.timestamp = null;
    apiCache.promise = null;
    return fetchTasks(true);
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasks();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchTasks]);

  return {
    tasks,
    isLoading,
    error,
    setTasks,
    setError,
    fetchTasks,
    refreshTasks
  };
}

export default function DailyTasksSection() {
  const {
    tasks,
    isLoading,
    error,
    setTasks,
    setError,
    refreshTasks
  } = useDailyTasks();

  const [isAddModal, setIsAddModal] = useState(false);

  // Updated handleAddTask to convert status and priority to backend format
  const handleAddTask = useCallback(async (task: FormTask) => {
    try {
      const requestBody = {
        defaultTaskId: task.defaultTaskId,
        operatorIds: task.operatorIds,
        priority: priorityUtils.toBackendFormat(task.priority), // Convert to backend format
        status: statusUtils.toBackendFormat(task.status), // Convert to backend format
      };

      const response = await fetch(`${API_BASE_URL}/createDailyTask`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.redirected) {
        setError("Authentication may have expired. Please refresh the page.");
        return;
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("Authentication required. Please login again.");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        await refreshTasks();
        setIsAddModal(false);
        setError(null);
      } else {
        throw new Error(result.message || "Failed to create task");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [refreshTasks, setError]);

  const handleEdit = useCallback(async (editedData: EditedTaskData) => {
    try {
      // Find the original task to get required fields
      const originalTask = tasks.find(t => t.id === editedData.id);
      if (!originalTask) {
        throw new Error("Task not found");
      }

      // Fetch operators to map operator names to IDs
      const operatorsResponse = await fetch("http://localhost:8000/api/admin/getOperators", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!operatorsResponse.ok) {
        throw new Error("Failed to fetch operators");
      }

      const operatorsResult = await operatorsResponse.json();
      if (!operatorsResult.success) {
        throw new Error("Failed to fetch operators data");
      }

      const operators = operatorsResult.data;

      // Map operator names to IDs
      const operatorIds = editedData.assigned_to
        .map(operatorName => {
          const operator = operators.find((op: Operator) => op.name === operatorName);
          return operator ? operator.id : null;
        })
        .filter((id: string) => id !== null);

      const requestBody = {
        priority: priorityUtils.toBackendFormat(editedData.priority), // Convert to backend format
        status: statusUtils.toBackendFormat(editedData.status), // Convert to backend format
        operatorIds: operatorIds,
      };

      console.log("Request Body for Edit:", requestBody);

      const response = await fetch(`${API_BASE_URL}/updateDailyTask/${editedData.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.redirected) {
        setError("Authentication may have expired. Please refresh the page.");
        return;
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("Authentication required. Please login again.");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        await refreshTasks();
        setError(null);
      } else {
        throw new Error(result.message || "Failed to update task");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [tasks, refreshTasks, setError]);

  const handleDelete = useCallback((id: string | number) => {
    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/deleteDailyTask/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.redirected) {
          setError("Authentication may have expired. Please refresh the page.");
          return;
        }

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError("Authentication required. Please login again.");
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setTasks((prev) => prev.filter((task) => task.id !== id));
        
        apiCache.data = null;
        apiCache.timestamp = null;
        
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
        refreshTasks();
      }
    })();
  }, [setTasks, setError, refreshTasks]);

  const handleAddClick = useCallback(() => {
    setIsAddModal(true);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    refreshTasks();
  }, [refreshTasks, setError]);

  const tableData = useMemo(() => 
    tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority, // Already in display format
      status: task.status, // Already in display format
      assigned_to: task.assigned_to,
    })), [tasks]
  );

  // Fixed handleTableEdit to properly handle the edited data
  const handleTableEdit = useCallback((editedItem: unknown) => {
    if (typeof editedItem === "object" && editedItem !== null && "id" in editedItem) {
      const editedData = editedItem as EditedTaskData;
      handleEdit(editedData); // Pass the edited data, not the original task
    }
  }, [handleEdit]);

  if (isLoading && tasks.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-lg">Loading daily tasks...</div>
      </div>
    );
  }

  return (
    <div className="p-4 h-screen relative">
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
        className="fixed top-18 sm:top-6 right-6 w-10 h-10 bg-[#1B3A6A] rounded-full flex items-center justify-center mb-4 cursor-pointer shadow-xl"
        onClick={handleAddClick}
      >
        <Plus className="w-5 h-5 text-[#D4E3F5]" />
      </button>

      {tasks.length > 0 ? (
        <div className="w-full">
          <div className="text-3xl pr-10 sm:pr-0 mt-5 sm:mt-0 font-bold mb-8">Daily Tasks Management</div>
          
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

// Export the utilities for use in other components (like AddTaskModal)
export { statusUtils, priorityUtils };