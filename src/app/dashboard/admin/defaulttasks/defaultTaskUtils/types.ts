// Core task interface
export interface Task {
  id: string;
  title: string;
  description: string;
  adminId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Table display interface
export interface TableItem {
  id: string | number;
  [key: string]: string | number | boolean | string[] | number[];
}

// API Response interfaces
export interface ApiResponse {
  success: boolean;
  data: Record<string, unknown>[];
}

export interface CreateTaskResponse {
  success: boolean;
  data?: { id: string };
  message?: string;
}

export interface UpdateTaskResponse {
  success: boolean;
  message?: string;
}

export interface DeleteTaskResponse {
  success: boolean;
  message?: string;
}

export interface VerifyResponse {
  data?: { title: string }[];
}

// Cache interface
export interface ApiCache {
  data: Task[] | null;
  timestamp: number;
  promise: Promise<Task[]> | null;
}

// Request interfaces
export interface CreateTaskRequest {
  title: string;
  description?: string;
  adminId?: string;
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
}

// Hook state interface
export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

// Component props interfaces
export interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: { title: string; description?: string }) => Promise<void>;
}

export interface SimpleTableProps {
  data: TableItem[];
  onEdit: (item: TableItem) => void;
  onDelete: (id: string | number) => void;
  searchFields: string[];
  itemsPerPage: number;
}