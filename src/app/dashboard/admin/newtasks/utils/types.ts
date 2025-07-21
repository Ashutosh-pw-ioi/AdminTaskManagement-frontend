// utils/types.ts

export interface ApiCache<T> {
  data: T | null;
  timestamp: number;
  promise: Promise<T> | null;
}

export interface Operator {
  id: string;
  name: string;
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  status: string;
  operatorIds: string[];
  adminId: string;
  assigned_to?: string[];
  operators?: Operator[];
}

export interface TaskTableItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  status: string;
  assigned_to: string[];
  [key: string]: string | number | boolean | string[] | number[];
}

export interface TableItem {
  id: string | number;
  [key: string]: string | number | boolean | string[] | number[];
}

export interface TaskData {
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  status: string;
  adminId: string;
  operatorIds: string[];
}

export interface User {
  id: string;
  name?: string;
}

export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  checkAuth: () => void;
}