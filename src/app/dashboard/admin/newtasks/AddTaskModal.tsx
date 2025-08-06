import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

interface Operator {
  id: string;
  name: string;
}

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    assigned_to: string[];
  }) => void;
}
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [status, setStatus] = useState<"pending" | "in-progress" | "completed">(
    "pending"
  );
  const [assigned_to, setAssignedTo] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch operators from backend
  const fetchOperators = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/admin/getOperators`,
         {
  credentials: "include"
}
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch operators");
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOperators(data.data);
        // Set default assignee to first operator if available
        if (data.data.length > 0 && assigned_to.length === 0) {
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

  // Fetch operators when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchOperators();
    }
  }, [isOpen]);

  const handleAssigneeToggle = (operatorId: string) => {
    setAssignedTo((prev) =>
      prev.includes(operatorId)
        ? prev.filter((id) => id !== operatorId)
        : [...prev, operatorId]
    );
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
      assigned_to,
    });

    setTitle("");
    setDescription("");
    setPriority("medium");
    setStatus("pending");
    setAssignedTo([]);
    setIsDropdownOpen(false);
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
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] relative overflow-hidden">
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

        <div className="p-6 overflow-y-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-4 pr-8">
            Add New Task
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1B3A6A] focus:border-[#1B3A6A]"
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1B3A6A] focus:border-[#1B3A6A]"
                placeholder="Enter task description"
                rows={3}
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
                    setPriority(e.target.value as "low" | "medium" | "high")
                  }
                  className="appearance-none w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1B3A6A] focus:border-[#1B3A6A]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
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
                      e.target.value as "pending" | "in-progress" | "completed"
                    )
                  }
                  className="appearance-none w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1B3A6A] focus:border-[#1B3A6A]"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
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
                    ) : assigned_to.length > 0 ? (
                      assigned_to.map((operatorId) => (
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

                {isDropdownOpen && !loading && !error && (
                  <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded shadow w-full max-h-48 overflow-y-auto">
                    {operators.map((operator) => (
                      <label
                        key={operator.id}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={assigned_to.includes(operator.id)}
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
              disabled={!title.trim()}
              className="px-4 py-2 bg-[#1B3A6A] text-white rounded-sm hover:bg-[#486AA0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Add Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;