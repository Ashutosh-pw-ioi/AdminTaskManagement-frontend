// createutils/dataTransformers.ts
import { TaskFromAPI, TransformedTask } from "./types";

export const transformApiTask = (task: TaskFromAPI): TransformedTask => ({
  id: task.id,
  title: task.defaultTask.title,
  description: task.defaultTask.description || "No description provided.",
  priority: task.priority,
  status: task.status,
  assigned_to: task.operators.map(operator => operator.name),
  defaultTaskId: task.defaultTaskId,
  operatorIds: task.operators.map(operator => operator.id),
  isCompleted: task.isCompleted,
  taskDate: task.taskDate,
});

export const transformApiTasks = (tasks: TaskFromAPI[]): TransformedTask[] => 
  tasks.map(transformApiTask);

export const transformTaskForTable = (task: TransformedTask) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  priority: task.priority,
  status: task.status,
  assigned_to: task.assigned_to,
});