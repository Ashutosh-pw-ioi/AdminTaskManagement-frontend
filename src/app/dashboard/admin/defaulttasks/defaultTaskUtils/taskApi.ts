// utils/taskApi.ts
import { Task, ApiResponse, TableItem } from './types';
import { apiCache, isCacheValid, invalidateCache, updateCache, setCachePromise } from './taskCache';
import { enforceDescription, getAuthHeaders } from './taskUtils';

const API_BASE_URL = 'http://localhost:8000/api/admin';

export class RequestTracker {
  private ongoingRequests = new Set<string>();

  has(key: string): boolean {
    return this.ongoingRequests.has(key);
  }

  add(key: string): void {
    this.ongoingRequests.add(key);
  }

  delete(key: string): void {
    this.ongoingRequests.delete(key);
  }
}

export const fetchTasks = async (
  requestTracker: RequestTracker,
  forceRefresh = false
): Promise<Task[]> => {
  const requestKey = 'getDefaultTasks';
  
  if (!forceRefresh && isCacheValid() && apiCache.data) {
    return apiCache.data;
  }

  if (requestTracker.has(requestKey)) {
    if (apiCache.promise) {
      return await apiCache.promise;
    }
  }

  if (!forceRefresh && apiCache.promise && isCacheValid()) {
    return apiCache.promise;
  }
  
  requestTracker.add(requestKey);
  
  const requestPromise = (async (): Promise<Task[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/getDefaultTasks`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as ApiResponse<Record<string, unknown>[]>;
      
      if (result.success) {
        const tasksWithDescription = result.data!.map(enforceDescription);
        updateCache(tasksWithDescription);
        return tasksWithDescription;
      } else {
        throw new Error('Failed to fetch tasks');
      }
    } catch (err) {
      invalidateCache();
      throw err;
    } finally {
      requestTracker.delete(requestKey);
    }
  })();

  setCachePromise(requestPromise);
  return requestPromise;
};

export const createTask = async (
  requestTracker: RequestTracker,
  task: { title: string; description?: string },
  userId?: string
): Promise<void> => {
  const requestKey = `createTask_${task.title}`;
  
  if (requestTracker.has(requestKey)) {
    return;
  }
  
  requestTracker.add(requestKey);
  
  try {
    const response = await fetch(`${API_BASE_URL}/createDefault`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        title: task.title,
        description: task.description || "No description provided.",
        adminId: userId
      }),
    });

    const result = await response.json() as ApiResponse<{ id: number }>;
    
    if (result.success || (result.data && result.data.id)) {
      invalidateCache();
      return;
    } else {
      // Verify if task was actually created
      const verifyResponse = await fetch(`${API_BASE_URL}/getDefaultTasks`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      
      if (verifyResponse.ok) {
        const verifyResult = await verifyResponse.json() as ApiResponse<{ title: string }[]>;
        const taskExists = verifyResult.data?.some((t: { title: string }) => t.title === task.title);
        
        if (taskExists) {
          invalidateCache();
          return;
        }
      }
      
      throw new Error(result.message || 'Failed to add task');
    }
  } catch (err) {
    // Verify if task was actually created despite the error
    try {
      const verifyResponse = await fetch(`${API_BASE_URL}/getDefaultTasks`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      
      if (verifyResponse.ok) {
        const verifyResult = await verifyResponse.json() as ApiResponse<{ title: string }[]>;
        const taskExists = verifyResult.data?.some((t: { title: string }) => t.title === task.title);
        
        if (taskExists) {
          invalidateCache();
          return;
        }
      }
    } catch (verifyErr) {
      // Silently handle verification error
    }
    
    throw err;
  } finally {
    requestTracker.delete(requestKey);
  }
};

export const updateTask = async (
  requestTracker: RequestTracker,
  item: TableItem
): Promise<void> => {
  const requestKey = `editTask_${item.id}`;
  
  if (requestTracker.has(requestKey)) {
    return;
  }
  
  requestTracker.add(requestKey);
  
  try {
    const response = await fetch(`${API_BASE_URL}/updateDefaultTask/${item.id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        title: item.title,
        description: item.description,
      }),
    });

    const result = await response.json() as ApiResponse;
    
    if (result.success || response.ok) {
      invalidateCache();
    } else {
      throw new Error(result.message || 'Failed to update task');
    }
  } catch (err) {
    invalidateCache();
    throw err;
  } finally {
    requestTracker.delete(requestKey);
  }
};

export const deleteTask = async (
  requestTracker: RequestTracker,
  id: number | string,
  currentTasks: Task[]
): Promise<void> => {
  const requestKey = `deleteTask_${id}`;
  
  if (requestTracker.has(requestKey)) {
    return;
  }
  
  requestTracker.add(requestKey);
  
  try {
    const response = await fetch(`${API_BASE_URL}/deleteDefaultTask/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    let result: ApiResponse | null = null;
    try {
      result = await response.json() as ApiResponse;
    } catch (jsonError) {
      await response.text();
      
      if (response.ok) {
        invalidateCache();
        return;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    if (result && (result.success || response.ok)) {
      invalidateCache();
    } else {
      throw new Error(result?.message || `Delete failed with status ${response.status}`);
    }
  } catch (err) {
    invalidateCache();
    
    // Check if task still exists after error
    const taskStillExists = currentTasks.some(task => task.id == id);
    if (!taskStillExists) {
      return; // Task was actually deleted
    }
    
    throw err;
  } finally {
    requestTracker.delete(requestKey);
  }
};