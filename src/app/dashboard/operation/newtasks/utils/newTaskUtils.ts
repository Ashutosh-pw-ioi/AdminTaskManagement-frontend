import { NewTask, TransformedNewTask, TaskCategories, NewTaskStatus } from './newTaskTypes';

/**
 * Transform API data to match table format
 */
export const transformNewTaskForTable = (task: NewTask): TransformedNewTask => {
  


return {
  id: task.id,
  title: task.title,
  description: task.description || "No description provided.",
  priority: task.priority.toLowerCase(),
  status: task.status.toLowerCase().replace('_', ' '),
  assigned_by: task.admin.name,
  due_date: task.dueDate,
  
 
  
};
};

/**
 * Convert table format status to API format
 */
export const convertNewTaskStatusToApiFormat = (status: string): NewTaskStatus => {
  console.log(`Converting status: ${status}`);
  if(status === 'inprogress') {
    return 'IN_PROGRESS';
  }
  return status.toUpperCase().replace(/ /g, '_') as NewTaskStatus;
};

/**
 * Split tasks by due date and status
 */
export const categorizeTasksByDueDate = (tasks: TransformedNewTask[]): TaskCategories => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const upcoming: TransformedNewTask[] = [];
  const overdue: TransformedNewTask[] = [];
  const completed: TransformedNewTask[] = [];

  tasks.forEach((task) => {
    const taskDueDate = new Date(task.due_date);
    taskDueDate.setHours(0, 0, 0, 0);
    
    if (task.status === "completed") {
      completed.push(task);
    } else if (taskDueDate < currentDate) {
      overdue.push(task);
    } else {
      upcoming.push(task);
    }
  });

  return { upcoming, overdue, completed };
};

/**
 * Find tasks with status changes compared to original data
 */
export const findChangedNewTasks = (
  currentTasks: TransformedNewTask[], 
  originalTasks: TransformedNewTask[]
): TransformedNewTask[] => {
  return currentTasks.filter(task => {
    const originalTask = originalTasks.find(orig => orig.id === task.id);
    return originalTask && originalTask.status !== task.status;
  });
};

/**
 * Get all tasks from categories
 */
export const getAllTasksFromCategories = (categories: TaskCategories): TransformedNewTask[] => {
  return [...categories.upcoming, ...categories.overdue, ...categories.completed];
};

/**
 * Update task in categories
 */
export const updateTaskInCategories = (
  categories: TaskCategories, 
  updatedTask: TransformedNewTask
): TaskCategories => {
  const allTasks = getAllTasksFromCategories(categories).map(task => 
    task.id === updatedTask.id ? updatedTask : task
  );
  
  return categorizeTasksByDueDate(allTasks);
};

/**
 * Dropdown configuration for new task management
 */
export const getNewTaskDropdownConfig = () => [
  {
    field: "status",
    options: [
      { value: "pending", label: "Pending" },
      { value: "in progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
    ],
  },
];

/**
 * Table configuration
 */
export const getNewTaskTableProps = () => ({
  searchFields: [] as string[],
  itemsPerPage: 4,
  badgeFields: ["priority", "assigned_by"],
  arrayFields: ["assigned_to"],
  dropdownFields: getNewTaskDropdownConfig(),
  showActions: false,
});