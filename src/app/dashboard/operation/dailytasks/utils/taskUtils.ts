import { DailyTask, TransformedTask, TaskStatus } from './taskTypes';


export const transformTaskForTable = (task: DailyTask): TransformedTask => {
  return {
    id: task.id,
    title: task.defaultTask.title,
    description: task.defaultTask.description || "No description provided.",
    status: task.status.toLowerCase().replace('_', ' '),
    priority: task.priority.toLowerCase(),
    taskDate: task.taskDate,
    assigned_by: [task.defaultTask.admin.name],
  };
};


export const convertStatusToApiFormat = (status: string): TaskStatus => {
  if(status === 'inprogress') {
    return 'IN_PROGRESS';
  }
  return status.toUpperCase().replace(' ', '_') as TaskStatus;
};


export const convertStatusToTableFormat = (status: TaskStatus): string => {
  return status.toLowerCase().replace('_', '');
};

export const findChangedTasks = (
  currentTasks: TransformedTask[], 
  originalTasks: TransformedTask[]
): TransformedTask[] => {
  return currentTasks.filter(task => {
    const originalTask = originalTasks.find(orig => orig.id === task.id);
    return originalTask && originalTask.status !== task.status;
  });
};


export const getTaskDropdownConfig = () => [
  {
    field: "status",
    options: [
      { value: "pending", label: "Pending" },
      { value: "in progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
    ],
  },
];