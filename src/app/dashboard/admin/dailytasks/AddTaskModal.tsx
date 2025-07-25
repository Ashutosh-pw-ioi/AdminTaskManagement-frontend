import React, { useState } from "react";
import { X, ChevronDown } from "lucide-react";

// Import from utils
import {
  AddTaskModalProps,
  Task,
  Priority,
  Status,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  useDefaultTasks,
  useOperators,
  getOperatorNameById,
  validateFormData,
  createFormData,
  getInitialFormState,
} from "./addTaskModalUtils";

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  // Form state
  const {
    selectedTask,
    priority,
    status,
    assignedTo,
    isDropdownOpen,
    error
  } = getInitialFormState();

  const [currentSelectedTask, setCurrentSelectedTask] = useState<Task | null>(selectedTask);
  const [currentPriority, setCurrentPriority] = useState<Priority>(priority);
  const [currentStatus, setCurrentStatus] = useState<Status>(status);
  const [currentAssignedTo, setCurrentAssignedTo] = useState<string[]>(assignedTo);
  const [currentIsDropdownOpen, setCurrentIsDropdownOpen] = useState(isDropdownOpen);
  const [currentError, setCurrentError] = useState(error);

  // Custom hooks
  const {
    defaultTasks,
    tasksLoading,
    tasksError,
    refetchTasks
  } = useDefaultTasks(isOpen);

  const {
    operators,
    loading,
    error: operatorsError,
  } = useOperators(isOpen);

  // Event handlers
  const handleTaskSelect = (task: Task) => {
    setCurrentSelectedTask(task);
    setCurrentPriority("MEDIUM");
    setCurrentStatus("PENDING");
    
    // Keep existing assigned_to or set to first operator if available
    if (currentAssignedTo.length === 0 && operators.length > 0) {
      setCurrentAssignedTo([operators[0].id]);
    }
    setCurrentIsDropdownOpen(false);
  };

  const handleAssigneeToggle = (operatorId: string) => {
    setCurrentAssignedTo((prev) =>
      prev.includes(operatorId)
        ? prev.filter((id) => id !== operatorId)
        : [...prev, operatorId]
    );
  };

  const handleSubmit = () => {
    const validationError = validateFormData(currentSelectedTask, currentAssignedTo);
    
    if (validationError) {
      setCurrentError(validationError);
      return;
    }

    const formData = createFormData(
      currentSelectedTask!,
      currentAssignedTo,
      currentPriority,
      currentStatus
    );

    onSubmit(formData);

    // Reset form
    const initialState = getInitialFormState();
    setCurrentSelectedTask(initialState.selectedTask);
    setCurrentPriority(initialState.priority);
    setCurrentStatus(initialState.status);
    setCurrentAssignedTo(initialState.assignedTo);
    setCurrentIsDropdownOpen(initialState.isDropdownOpen);
    setCurrentError(initialState.error);
    onClose();
  };

  if (!isOpen) return null;

  const displayError = currentError || operatorsError;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label="Close modal"
        >
          <X
            size={20}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          />
        </button>

        {displayError && (
          <div className="mx-3 mt-3 sm:mx-6 sm:mt-6 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{displayError}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row h-[85vh] sm:h-[80vh]">
          {/* Left Pane - Task List */}
          <div className="w-full lg:w-1/2 lg:border-r border-gray-200 p-3 sm:p-6 overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 pr-6 sm:pr-8">
              Default Tasks
            </h3>

            {tasksLoading ? (
              <div className="flex items-center justify-center p-4 sm:p-8">
                <div className="text-gray-500 text-sm sm:text-base">Loading default tasks...</div>
              </div>
            ) : tasksError ? (
              <div className="flex flex-col items-center justify-center p-4 sm:p-8">
                <div className="text-red-500 text-center mb-4 text-sm sm:text-base">{tasksError}</div>
                <button
                  onClick={refetchTasks}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-[#1B3A6A] text-white rounded hover:bg-[#486AA0] transition-colors text-sm sm:text-base"
                >
                  Retry
                </button>
              </div>
            ) : defaultTasks.length === 0 ? (
              <div className="flex items-center justify-center p-4 sm:p-8">
                <div className="text-gray-500 text-sm sm:text-base">No default tasks available</div>
              </div>
            ) : (
              <div className="space-y-2">
                {defaultTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm hover:bg-gray-50 ${
                      currentSelectedTask?.id === task.id
                        ? "border-[#1B3A6A] bg-blue-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => handleTaskSelect(task)}
                  >
                    <div className="flex-1 min-w-0 mb-2 sm:mb-0">
                      <h4 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <button
                      className="px-3 py-1 text-xs bg-[#1B3A6A] text-white rounded hover:bg-[#486AA0] transition-colors cursor-pointer self-start sm:self-auto"
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
          <div className="w-full lg:w-1/2 p-3 sm:p-6 overflow-y-auto border-t lg:border-t-0 border-gray-200 lg:border-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
              {currentSelectedTask ? "Create Daily Task" : "Select a Default Task"}
            </h3>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selected Task *
                </label>
                <input
                  type="text"
                  value={currentSelectedTask?.title || ""}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-200 text-sm sm:text-base"
                  placeholder="Select from Above"
                  required
                  disabled={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={currentSelectedTask?.description || ""}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-200 resize-none text-sm sm:text-base"
                  rows={3}
                  placeholder="Select from Above"
                  disabled={true}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      value={currentPriority}
                      onChange={(e) => setCurrentPriority(e.target.value as Priority)}
                      className="appearance-none w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1B3A6A] focus:border-[#1B3A6A] text-sm sm:text-base"
                    >
                      {PRIORITY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
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
                      value={currentStatus}
                      onChange={(e) => setCurrentStatus(e.target.value as Status)}
                      className="appearance-none w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1B3A6A] focus:border-[#1B3A6A] text-sm sm:text-base"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To *
                </label>
                <div className="relative">
                  <div
                    className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-[#1B3A6A] focus-within:border-[#1B3A6A] cursor-pointer min-h-[42px]"
                    onClick={() => setCurrentIsDropdownOpen(!currentIsDropdownOpen)}
                  >
                    <div className="flex-1 flex flex-wrap gap-1">
                      {loading ? (
                        <span className="text-gray-400 text-xs sm:text-sm">Loading operators...</span>
                      ) : operatorsError ? (
                        <span className="text-red-500 text-xs sm:text-sm">{operatorsError}</span>
                      ) : currentAssignedTo.length > 0 ? (
                        currentAssignedTo.map((operatorId) => (
                          <span
                            key={operatorId}
                            className="bg-[#1B3A6A] text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                          >
                            {getOperatorNameById(operators, operatorId)}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs sm:text-sm">
                          Select assignees
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      size={18}
                      className={`ml-2 text-gray-500 transition-transform flex-shrink-0 ${
                        currentIsDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {currentIsDropdownOpen && !loading && (
                    <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded shadow w-full max-h-40 sm:max-h-48 overflow-y-auto">
                      {operators.map((operator) => (
                        <label
                          key={operator.id}
                          className="flex items-center px-3 sm:px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={currentAssignedTo.includes(operator.id)}
                            onChange={() => handleAssigneeToggle(operator.id)}
                            className="mr-2 flex-shrink-0"
                          />
                          <span className="truncate">{operator.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-sm hover:bg-gray-300 transition-colors cursor-pointer text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!currentSelectedTask || currentAssignedTo.length === 0}
                className="w-full sm:w-auto px-4 py-2 bg-[#1B3A6A] text-white rounded-sm hover:bg-[#486AA0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm sm:text-base order-1 sm:order-2"
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