// utils/formUtils.ts
import { Operator, FormTask, Task } from './types';

// Get operator name by ID
export const getOperatorNameById = (operators: Operator[], id: string): string => {
  const operator = operators.find(op => op.id === id);
  return operator ? operator.name : id;
};

// Validate form data
export const validateFormData = (
  selectedTask: Task | null,
  assignedTo: string[]
): string | null => {
  if (!selectedTask) {
    return "Please select a default task";
  }

  if (assignedTo.length === 0) {
    return "Please assign to at least one operator";
  }

  return null;
};

// Create form data object
export const createFormData = (
  selectedTask: Task,
  assignedTo: string[],
  priority: "LOW" | "MEDIUM" | "HIGH",
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
): FormTask => {
  return {
    defaultTaskId: selectedTask.id,
    operatorIds: assignedTo,
    priority,
    status,
  };
};

// Reset form state
export const getInitialFormState = () => ({
  selectedTask: null,
  priority: "MEDIUM" as const,
  status: "PENDING" as const,
  assignedTo: [],
  isDropdownOpen: false,
  error: "",
});