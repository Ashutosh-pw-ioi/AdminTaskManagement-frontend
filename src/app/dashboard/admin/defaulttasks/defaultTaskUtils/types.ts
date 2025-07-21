// utils/types.ts

export interface Task {
  id: number;
  title: string;
  description: string;
  adminId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TableItem {
  id: string | number;
  [key: string]: string | number | boolean | string[] | number[];
}

export interface ApiCache {
  data: Task[] | null;
  timestamp: number;
  promise: Promise<Task[]> | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}