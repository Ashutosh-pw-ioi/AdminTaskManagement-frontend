import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

const API_BASE_URL = "http://localhost:8000/api/admin";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  assigned_to?: string;
}

interface FormTask {
  defaultTaskId: string;
  operatorIds: string[];
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

interface Operator {
  id: string;
  name: string;
  email: string;
}

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: FormTask) => void;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

// Helper function to enforce description
const enforceDescription = (task: any) => {
  return {
    ...task,
    description: task.description || ''
  };
};

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [status, setStatus] = useState<"PENDING" | "IN_PROGRESS" | "COMPLETED">("PENDING");
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [defaultTasks, setDefaultTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState("");
  const [tasksError, setTasksError] = useState<string | null>(null);

  // Fetch default tasks from backend
  const fetchDefaultTasks = async () => {
    try {
      setTasksLoading(true);
      setTasksError(null);
      
      const response = await fetch(`${API_BASE_URL}/getDefaultTasks`, {
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
        setDefaultTasks(tasksWithDescription);
      } else {
        throw new Error('Failed to fetch default tasks');
      }
    } catch (err) {
      console.error('Error fetching default tasks:', err);
      setTasksError(err instanceof Error ? err.message : 'Failed to fetch default tasks');
    } finally {
      setTasksLoading(false);
    }
  };

  // Fetch operators from backend
  const fetchOperators = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/getOperators`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch operators");
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOperators(data.data);
        // Set default assignee to first operator if available
        if (data.data.length > 0 && assignedTo.length === 0) {
          setAssignedTo([data.data[0].id]);
        }
      } else {
        throw new Error("Failed to load operators");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load operators");
      console.error("Error fetching operators:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDefaultTasks();
      fetchOperators();
    }
  }, [isOpen]);

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setPriority("MEDIUM");
    setStatus("PENDING");
    // Keep existing assigned_to or set to first operator if available
    if (assignedTo.length === 0 && operators.length > 0) {
      setAssignedTo([operators[0].id]);
    }
    setIsDropdownOpen(false);
  };

  const handleAssigneeToggle = (operatorId: string) => {
    setAssignedTo((prev) =>
      prev.includes(operatorId)
        ? prev.filter((id) => id !== operatorId)
        : [...prev, operatorId]
    );
  };

  const handleSubmit = () => {
    if (!selectedTask) {
      setError("Please select a default task");
      return;
    }

    if (assignedTo.length === 0) {
      setError("Please assign to at least one operator");
      return;
    }

    const formData: FormTask = {
      defaultTaskId: selectedTask.id,
      operatorIds: assignedTo,
      priority,
      status,
    };

    onSubmit(formData);

    // Reset form
    setSelectedTask(null);
    setPriority("MEDIUM");
    setStatus("PENDING");
    setAssignedTo([]);
    setIsDropdownOpen(false);
    setError("");
    onClose();
  };

  // Get operator name by ID
  const getOperatorNameById = (id: string) => {
    const operator = operators.find(op => op.id === id);
    return operator ? operator.name : id;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label="Close modal"
        >
          <X
            size={20}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          />
        </button>

        {error && (
          <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="flex h-[80vh]">
          {/* Left Pane - Task List */}
          <div className="w-1/2 border-r border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4 pr-8">
              Default Tasks
            </h3>

            {tasksLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-gray-500">Loading default tasks...</div>
              </div>
            ) : tasksError ? (
              <div className="flex flex-col items-center justify-center p-8">
                <div className="text-red-500 text-center mb-4">{tasksError}</div>
                <button
                  onClick={fetchDefaultTasks}
                  className="px-4 py-2 bg-[#1B3A6A] text-white rounded hover:bg-[#486AA0] transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : defaultTasks.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-gray-500">No default tasks available</div>
              </div>
            ) : (
              <div className="space-y-2">
                {defaultTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm hover:bg-gray-50 ${
                      selectedTask?.id === task.id
                        ? "border-[#1B3A6A] bg-blue-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => handleTaskSelect(task)}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <button
                      className="px-3 py-1 text-xs bg-[#1B3A6A] text-white rounded hover:bg-[#486AA0] transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskSelect(task);
                      }}
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Pane - Form */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {selectedTask ? "Create Daily Task" : "Select a Default Task"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selected Task *
                </label>
                <input
                  type="text"
                  value={selectedTask?.title || ""}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-200"
                  placeholder="Select from Left Pane"
                  required
                  disabled={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={selectedTask?.description || ""}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-200 resize-none"
                  rows={3}
                  placeholder="Select from Left Pane"
                  disabled={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <div className="relative">
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")
                    }
                    className="appearance-none w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1B3A6A] focus:border-[#1B3A6A]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value as "PENDING" | "IN_PROGRESS" | "COMPLETED"
                      )
                    }
                    className="appearance-none w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1B3A6A] focus:border-[#1B3A6A]"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To *
                </label>
                <div className="relative">
                  <div
                    className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-[#1B3A6A] focus-within:border-[#1B3A6A] cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="flex-1 flex flex-wrap gap-1">
                      {loading ? (
                        <span className="text-gray-400 text-sm">Loading operators...</span>
                      ) : error ? (
                        <span className="text-red-500 text-sm">{error}</span>
                      ) : assignedTo.length > 0 ? (
                        assignedTo.map((operatorId) => (
                          <span
                            key={operatorId}
                            className="bg-[#1B3A6A] text-white text-xs px-2 py-1 rounded"
                          >
                            {getOperatorNameById(operatorId)}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Select assignees
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      size={18}
                      className={`ml-2 text-gray-500 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {isDropdownOpen && !loading && (
                    <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded shadow w-full max-h-48 overflow-y-auto">
                      {operators.map((operator) => (
                        <label
                          key={operator.id}
                          className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={assignedTo.includes(operator.id)}
                            onChange={() => handleAssigneeToggle(operator.id)}
                            className="mr-2"
                          />
                          {operator.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-sm hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedTask || assignedTo.length === 0}
                className="px-4 py-2 bg-[#1B3A6A] text-white rounded-sm hover:bg-[#486AA0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;