import { useState, useEffect, useCallback } from 'react';
import { TransformedTask } from './taskTypes';
import { fetchDailyTasks, updateTaskStatus } from './taskApi';
import { 
  transformTaskForTable, 
  convertStatusToApiFormat, 
  findChangedTasks 
} from './taskUtils';

interface UseTaskManagementReturn {
  tasks: TransformedTask[];
  originalTasks: TransformedTask[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  handleEdit: (updatedItem: TransformedTask) => void;
  handleBulkUpdate: () => Promise<void>;
  clearError: () => void;
}

export const useTaskManagement = (): UseTaskManagementReturn => {
  const [tasks, setTasks] = useState<TransformedTask[]>([]);
  const [originalTasks, setOriginalTasks] = useState<TransformedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchDailyTasks();
      
      const transformedTasks = data.tasks.map(transformTaskForTable);
      setTasks(transformedTasks);
      setOriginalTasks([...transformedTasks]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEdit = useCallback((updatedItem: TransformedTask) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedItem.id ? updatedItem : task
      )
    );
  }, []);

  const handleBulkUpdate = useCallback(async () => {
    try {
      setError(null);
      
      const changedTasks = findChangedTasks(tasks, originalTasks);

      if (changedTasks.length === 0) {
       
        return;
      }

      for (const task of changedTasks) {
        const apiStatus = convertStatusToApiFormat(task.status);
        await updateTaskStatus(task.id, apiStatus);
      }
      setOriginalTasks([...tasks]);
      
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to perform bulk update';
      setError(errorMessage);
    }
  }, [tasks, originalTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    originalTasks,
    loading,
    error,
    fetchTasks,
    handleEdit,
    handleBulkUpdate,
    clearError,
  };
};