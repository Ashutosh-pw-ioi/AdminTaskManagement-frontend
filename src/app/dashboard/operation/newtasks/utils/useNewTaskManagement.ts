import { useState, useEffect, useCallback } from 'react';
import { 
  TransformedNewTask, 
  TaskCategories, 
  CollapsibleState
} from './newTaskTypes';
import { fetchNewTasks, updateNewTaskStatus } from './newTaskApi';
import { 
  transformNewTaskForTable, 
  categorizeTasksByDueDate,
  convertNewTaskStatusToApiFormat,
  findChangedNewTasks,
  getAllTasksFromCategories,
  updateTaskInCategories
} from './newTaskUtils';

interface UseNewTaskManagementReturn {
  taskCategories: TaskCategories;
  originalTasks: TransformedNewTask[];
  loading: boolean;
  error: string | null;
  collapsibleState: CollapsibleState;
  fetchTasks: () => Promise<void>;
  handleEdit: (updatedItem: TransformedNewTask) => void;
  handleBulkUpdate: () => Promise<void>;
  toggleCollapsible: (section: keyof CollapsibleState) => void;
  clearError: () => void;
  hasChanges: boolean;
}

export const useNewTaskManagement = (): UseNewTaskManagementReturn => {
  const [taskCategories, setTaskCategories] = useState<TaskCategories>({
    upcoming: [],
    overdue: [],
    completed: [],
  });
  const [originalTasks, setOriginalTasks] = useState<TransformedNewTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsibleState, setCollapsibleState] = useState<CollapsibleState>({
    overdue: true,
    completed: true,
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const toggleCollapsible = useCallback((section: keyof CollapsibleState) => {
    setCollapsibleState(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchNewTasks();
      
      const transformedTasks = data.tasks.map(transformNewTaskForTable);
      const categories = categorizeTasksByDueDate(transformedTasks);
      
      setTaskCategories(categories);
      setOriginalTasks(transformedTasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch new tasks';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEdit = useCallback((updatedItem: TransformedNewTask) => {
    setTaskCategories(prevCategories => 
      updateTaskInCategories(prevCategories, updatedItem)
    );
  }, []);

  const handleBulkUpdate = useCallback(async () => {
    try {
      setError(null);
      
      const allCurrentTasks = getAllTasksFromCategories(taskCategories);
      const changedTasks = findChangedNewTasks(allCurrentTasks, originalTasks);

      if (changedTasks.length === 0) {
        console.log('No status changes to update');
        return;
      }

      for (const task of changedTasks) {
        const apiStatus = convertNewTaskStatusToApiFormat(task.status);
        await updateNewTaskStatus(task.id, apiStatus);
      }

      // Update original tasks to match current state
      setOriginalTasks(allCurrentTasks);
      
      console.log(`Successfully updated ${changedTasks.length} new tasks`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to perform bulk update';
      setError(errorMessage);
    }
  }, [taskCategories, originalTasks]);

  // Check if there are any changes
  const hasChanges = getAllTasksFromCategories(taskCategories).some(task => {
    const originalTask = originalTasks.find(orig => orig.id === task.id);
    return originalTask && originalTask.status !== task.status;
  });

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    taskCategories,
    originalTasks,
    loading,
    error,
    collapsibleState,
    fetchTasks,
    handleEdit,
    handleBulkUpdate,
    toggleCollapsible,
    clearError,
    hasChanges,
  };
};