// utils/caseConversion.ts
import { Task } from "./types";

// Priority mappings
export const Priority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH"
} as const;

export const TaskStatus = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED"
} as const;

// Frontend display to backend mapping
const PRIORITY_DISPLAY_TO_BACKEND: Record<string, string> = {
  "Low": Priority.LOW,
  "Medium": Priority.MEDIUM,
  "High": Priority.HIGH,
  // Handle case variations
  "low": Priority.LOW,
  "medium": Priority.MEDIUM,
  "high": Priority.HIGH,
  "LOW": Priority.LOW,
  "MEDIUM": Priority.MEDIUM,
  "HIGH": Priority.HIGH
};

const STATUS_DISPLAY_TO_BACKEND: Record<string, string> = {
  "Pending": TaskStatus.PENDING,
  "In Progress": TaskStatus.IN_PROGRESS,
  "Completed": TaskStatus.COMPLETED,
  // Handle case variations
  "pending": TaskStatus.PENDING,
  "in progress": TaskStatus.IN_PROGRESS,
  "inprogress": TaskStatus.IN_PROGRESS,
  "completed": TaskStatus.COMPLETED,
  "PENDING": TaskStatus.PENDING,
  "IN_PROGRESS": TaskStatus.IN_PROGRESS,
  "COMPLETED": TaskStatus.COMPLETED
};

// Backend to frontend display mapping
const PRIORITY_BACKEND_TO_DISPLAY: Record<string, string> = {
  [Priority.LOW]: "Low",
  [Priority.MEDIUM]: "Medium",
  [Priority.HIGH]: "High"
};

const STATUS_BACKEND_TO_DISPLAY: Record<string, string> = {
  [TaskStatus.PENDING]: "Pending",
  [TaskStatus.IN_PROGRESS]: "In Progress",
  [TaskStatus.COMPLETED]: "Completed"
};

// Conversion functions for Priority
export const convertPriorityToBackend = (frontendPriority: string): string => {
  const backendValue = PRIORITY_DISPLAY_TO_BACKEND[frontendPriority];
  if (!backendValue) {
    console.warn(`Unknown priority: ${frontendPriority}, defaulting to LOW`);
    return Priority.LOW;
  }
  return backendValue;
};

export const convertPriorityToFrontend = (backendPriority: string): string => {
  const frontendValue = PRIORITY_BACKEND_TO_DISPLAY[backendPriority];
  if (!frontendValue) {
    console.warn(`Unknown backend priority: ${backendPriority}, defaulting to Low`);
    return "Low";
  }
  return frontendValue;
};

// Conversion functions for Status
export const convertStatusToBackend = (frontendStatus: string): string => {
  const backendValue = STATUS_DISPLAY_TO_BACKEND[frontendStatus];
  if (!backendValue) {
    console.warn(`Unknown status: ${frontendStatus}, defaulting to PENDING`);
    return TaskStatus.PENDING;
  }
  return backendValue;
};

export const convertStatusToFrontend = (backendStatus: string): string => {
  const frontendValue = STATUS_BACKEND_TO_DISPLAY[backendStatus];
  if (!frontendValue) {
    console.warn(`Unknown backend status: ${backendStatus}, defaulting to Pending`);
    return "Pending";
  }
  return frontendValue;
};

// Get all display options for dropdowns
export const getPriorityOptions = (): string[] => {
  return ["Low", "Medium", "High"];
};

export const getStatusOptions = (): string[] => {
  return ["Pending", "In Progress", "Completed"];
};

// Helper function to transform task data from backend to frontend
export const transformTaskFromBackend = (task: Task) => {
  return {
    ...task,
    priority: convertPriorityToFrontend(task.priority),
    status: convertStatusToFrontend(task.status)
  };
};

// Helper function to transform task data from frontend to backend
export const transformTaskToBackend = (task: Task) => {
  return {
    ...task,
    priority: convertPriorityToBackend(task.priority),
    status: convertStatusToBackend(task.status)
  };
};