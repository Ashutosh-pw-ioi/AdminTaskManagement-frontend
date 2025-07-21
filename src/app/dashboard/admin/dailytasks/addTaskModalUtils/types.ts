// utils/types.ts
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  assigned_to?: string;
}

export interface FormTask {
  defaultTaskId: string;
  operatorIds: string[];
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

export interface Operator {
  id: string;
  name: string;
  email: string;
}

export interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: FormTask) => void;
}

export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED";