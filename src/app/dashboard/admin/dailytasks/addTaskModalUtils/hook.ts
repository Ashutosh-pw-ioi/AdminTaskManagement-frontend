// utils/hooks.ts
import { useState, useEffect } from 'react';
import { Task, Operator } from './types';
import { fetchDefaultTasks, fetchOperators } from './apiUtils';

// Custom hook for managing default tasks
export const useDefaultTasks = (isOpen: boolean) => {
  const [defaultTasks, setDefaultTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const loadDefaultTasks = async () => {
    try {
      setTasksLoading(true);
      setTasksError(null);
      const tasks = await fetchDefaultTasks();
      setDefaultTasks(tasks);
    } catch (err) {
      console.error('Error fetching default tasks:', err);
      setTasksError(err instanceof Error ? err.message : 'Failed to fetch default tasks');
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDefaultTasks();
    }
  }, [isOpen]);

  return {
    defaultTasks,
    tasksLoading,
    tasksError,
    refetchTasks: loadDefaultTasks
  };
};

// Custom hook for managing operators
export const useOperators = (isOpen: boolean) => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOperators = async () => {
    try {
      setLoading(true);
      setError("");
      const operatorData = await fetchOperators();
      setOperators(operatorData);
      return operatorData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load operators";
      setError(errorMessage);
      console.error("Error fetching operators:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadOperators();
    }
  }, [isOpen]);

  return {
    operators,
    loading,
    error,
    refetchOperators: loadOperators
  };
};