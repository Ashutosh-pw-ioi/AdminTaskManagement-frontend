// hooks/useTasks.ts
import { useCallback, useMemo, useRef } from "react";
import { createTaskService, invalidateCaches } from "../utils/taskService";
import { Task,   Operator, AuthContext } from "../utils/types";

export const useTasks = ({ getAuthHeaders,  setOperators, setTasks, }: {
  getAuthHeaders: () => Record<string, string>,
  operators: Operator[],
  setOperators: React.Dispatch<React.SetStateAction<Operator[]>>,
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  checkAuth: AuthContext["checkAuth"],
  user: AuthContext["user"]
}) => {
  const taskService = useMemo(() => createTaskService(getAuthHeaders), [getAuthHeaders]);
  const ongoingRequests = useRef<Set<string>>(new Set());

  const loadOperators = useCallback(async () => {
    const key = 'loadOperators';
    if (ongoingRequests.current.has(key)) return;
    ongoingRequests.current.add(key);
    try {
      const data = await taskService.fetchOperators();
      setOperators(data);
    } finally {
      ongoingRequests.current.delete(key);
    }
  }, [taskService, setOperators]);

  const loadTasks = useCallback(async () => {
    const key = 'loadTasks';
    if (ongoingRequests.current.has(key)) return;
    ongoingRequests.current.add(key);
    try {
      const data = await taskService.fetchTasks();
      setTasks(data);
    } finally {
      ongoingRequests.current.delete(key);
    }
  }, [taskService, setTasks]);

  return { taskService, loadOperators, loadTasks, invalidateCaches };
};
