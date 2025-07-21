export interface Admin {
  id: string;
  name: string;
  email: string;
}

export interface DefaultTask {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  adminId: string;
  admin: Admin;
}

export interface DailyTask {
  id: string;
  taskDate: string;
  isCompleted: boolean;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  defaultTaskId: string;
  defaultTask: DefaultTask;
}

export interface ApiResponse {
  success: boolean;
  tasks: DailyTask[];
}

// Define TableItem interface if not already defined elsewhere
export interface TableItem {
  [key: string]: string | number | boolean | string[] | number[];
}

export interface TransformedTask extends TableItem{
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  taskDate: string;
  assigned_by: string[];
   [key: string]: string | number | boolean | string[] | number[];
}

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownField {
  field: string;
  options: DropdownOption[];
}