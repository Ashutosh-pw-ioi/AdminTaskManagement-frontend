// utils/apiUtils.ts
import { API_BASE_URL } from './constants';
import { Task, Operator } from './types';

// Helper function to get auth headers
export const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

// Helper function to enforce description
export const enforceDescription = (task: unknown): Task => {
  if (typeof task === 'object' && task !== null) {
    return {
      ...(task as Record<string, unknown>),
      description: (task as Record<string, unknown>).description || ''
    } as Task;
  }
  return { description: '', id: '', title: '' } as Task;
};

// Fetch default tasks from backend
export const fetchDefaultTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${API_BASE_URL}/getDefaultTasks`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.success) {
    return result.data.map((task: unknown) => enforceDescription(task));
  } else {
    throw new Error('Failed to fetch default tasks');
  }
};

// Fetch operators from backend
export const fetchOperators = async (): Promise<Operator[]> => {
  const response = await fetch(`${API_BASE_URL}/getOperators`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: "include"
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch operators");
  }
  
  const data = await response.json();
  
  if (data.success) {
    return data.data;
  } else {
    throw new Error("Failed to load operators");
  }
};