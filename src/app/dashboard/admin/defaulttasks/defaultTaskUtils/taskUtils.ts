// utils/taskUtils.ts
import { Task, TableItem } from './types';

export const enforceDescription = (task: Record<string, unknown>): Task => {
  return {
    id: Number(task.id),
    title: String(task.title || ''),
    description: task.description ? String(task.description) : "No description provided.",
    adminId: task.adminId ? String(task.adminId) : undefined,
    createdAt: task.createdAt ? String(task.createdAt) : undefined,
    updatedAt: task.updatedAt ? String(task.updatedAt) : undefined,
  };
};

export const prepareTasksForDisplay = (tasks: Task[]): TableItem[] => {
  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description
  }));
};

export const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};