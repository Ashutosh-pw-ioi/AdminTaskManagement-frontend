// utils/taskService.ts
import { ApiCache, Operator, Task, TaskData } from "./types";

const CACHE_DURATION = 5 * 60 * 1000;

let tasksCache: ApiCache<Task[]> = { data: null, timestamp: 0, promise: null };
let operatorsCache: ApiCache<Operator[]> = { data: null, timestamp: 0, promise: null };

export const invalidateCaches = () => {
  tasksCache = { data: null, timestamp: 0, promise: null };
  operatorsCache = { data: null, timestamp: 0, promise: null };
};

export const createTaskService = (getAuthHeaders: () => Record<string, string>) => {
  const API_BASE_URL = "http://localhost:8000/api/admin";

  return {
    async fetchOperators(forceRefresh = false): Promise<Operator[]> {
      const isCacheValid = () => Date.now() - operatorsCache.timestamp < CACHE_DURATION;
      if (!forceRefresh && isCacheValid() && operatorsCache.data) return operatorsCache.data;
      if (!forceRefresh && operatorsCache.promise && isCacheValid()) return operatorsCache.promise;

      const requestPromise = (async (): Promise<Operator[]> => {
        const response = await fetch(`${API_BASE_URL}/getOperators`, {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        const data = result.success ? result.data : [];
        operatorsCache = { data, timestamp: Date.now(), promise: null };
        return data;
      })().catch(err => {
        console.error(err);
        operatorsCache = { data: null, timestamp: 0, promise: null };
        return [];
      });

      operatorsCache.promise = requestPromise;
      return requestPromise;
    },

    async fetchTasks(forceRefresh = false): Promise<Task[]> {
      const isCacheValid = () => Date.now() - tasksCache.timestamp < CACHE_DURATION;
      if (!forceRefresh && isCacheValid() && tasksCache.data) return tasksCache.data;
      if (!forceRefresh && tasksCache.promise && isCacheValid()) return tasksCache.promise;

      const requestPromise = (async (): Promise<Task[]> => {
        const response = await fetch(`${API_BASE_URL}/getNewTask`, {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        const data = result.data || [];
        tasksCache = { data, timestamp: Date.now(), promise: null };
        return data;
      })().catch(err => {
        tasksCache = { data: null, timestamp: 0, promise: null };
        throw err;
      });

      tasksCache.promise = requestPromise;
      return requestPromise;
    },

    async createTask(taskData: TaskData) {
      const response = await fetch(`${API_BASE_URL}/createNew`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData),
        credentials: 'include',
      });

      const text = await response.text();
      const responseData = JSON.parse(text || '{}');

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status} - ${responseData.error || ''}`);
      tasksCache = { data: null, timestamp: 0, promise: null };
      return responseData;
    },

    async updateTask(id: string, update: Partial<TaskData>) {
      const response = await fetch(`${API_BASE_URL}/updateNewTask/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(update),
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      tasksCache = { data: null, timestamp: 0, promise: null };
      return response.json();
    },

    async deleteTask(id: string) {
      const response = await fetch(`${API_BASE_URL}/deleteNewTask/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      tasksCache = { data: null, timestamp: 0, promise: null };
      return response.json();
    },
  };
};
