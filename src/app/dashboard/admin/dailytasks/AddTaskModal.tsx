import React, { useState } from "react";
import { X, Check, ChevronDown } from "lucide-react";
import { DefaultTasks } from "../constants/DefaultTasks";

interface Task {
  id: number;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  status?: "pending" | "in-progress" | "completed";
  assigned_to?: string;
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

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [status, setStatus] = useState<"pending" | "in-progress" | "completed">(
    "pending"
  );
  const [assigned_to, setAssignedTo] = useState<string[]>(["op101"]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority("medium");
    setStatus("pending");
    setAssignedTo(["op101"]);
    setIsDropdownOpen(false);
  };

  const handleAssigneeToggle = (assignee: string) => {
    setAssignedTo((prev) =>
      prev.includes(assignee)
        ? prev.filter((a) => a !== assignee)
        : [...prev, assignee]
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
    setAssignedTo(["op101"]);
    setSelectedTask(null);
    setIsDropdownOpen(false);
    onClose();
  };

  const assigneeOptions = ["op101", "op102", "op103", "op104", "op105"];

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

        <div className="flex h-[80vh]">
          {/* Left Pane - Task List */}
          <div className="w-1/2 border-r border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4 pr-8">
              Existing Tasks
            </h3>

            <div className="space-y-2">
              {DefaultTasks.map((task) => (
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
          </div>

          {/* Right Pane - Form */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {selectedTask ? "Edit Task" : "Add New Task"}
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
                        e.target.value as
                          | "pending"
                          | "in-progress"
                          | "completed"
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
                      {assigned_to.length > 0 ? (
                        assigned_to.map((assignee) => (
                          <span
                            key={assignee}
                            className="bg-[#1B3A6A] text-white text-xs px-2 py-1 rounded"
                          >
                            {assignee}
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

                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded shadow w-full max-h-48 overflow-y-auto">
                      {assigneeOptions.map((assignee) => (
                        <label
                          key={assignee}
                          className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={assigned_to.includes(assignee)}
                            onChange={() => handleAssigneeToggle(assignee)}
                            className="mr-2"
                          />
                          {assignee}
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
                {selectedTask ? "Update Task" : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
