// utils/taskUtils.ts
import { Task, TaskTableItem } from "./types";

export const filterTasksForUI = (tasks: Task[]): TaskTableItem[] =>
  tasks.filter(task => task.id).map(task => ({
    id: task.id!,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    priority: task.priority,
    status: task.status,
    assigned_to: task.assigned_to || []
  }));
