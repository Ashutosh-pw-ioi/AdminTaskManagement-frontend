import { 
  Task, 
  ApiResponse, 
  CreateTaskResponse, 
  UpdateTaskResponse, 
  DeleteTaskResponse, 
  VerifyResponse,
  CreateTaskRequest,
  UpdateTaskRequest
} from './types';
import { TaskUtils } from './taskUtils';
import { TaskCache } from './taskCache';

const API_BASE_URL = 'http://localhost:8000/api/admin';

export class TaskApi {
  private static ongoingRequests = new Set<string>();

  /**
   * Checks if a request is already in progress
   */
  private static isRequestInProgress(key: string): boolean {
    return this.ongoingRequests.has(key);
  }

  /**
   * Adds a request to the ongoing requests set
   */
  private static addRequest(key: string): void {
    this.ongoingRequests.add(key);
  }

  /**
   * Removes a request from the ongoing requests set
   */
  private static removeRequest(key: string): void {
    this.ongoingRequests.delete(key);
  }

  /**
   * Fetches tasks from the API with caching support
   */
  static async fetchTasks(forceRefresh = false): Promise<Task[]> {
    const requestKey = 'getDefaultTasks';
    
    // Check cache first
    if (!forceRefresh && TaskCache.isCacheValid()) {
      const cachedData = TaskCache.getCachedData();
      if (cachedData) {
        return cachedData;
      }
    }

    // Check for ongoing request
    if (this.isRequestInProgress(requestKey)) {
      const cachedPromise = TaskCache.getCachePromise();
      if (cachedPromise) {
        return cachedPromise;
      }
    }

    // If we have a cached promise and cache is valid, use it
    if (!forceRefresh && TaskCache.getCachePromise() && TaskCache.isCacheValid()) {
      const cachedPromise = TaskCache.getCachePromise();
      if (cachedPromise) {
        return cachedPromise;
      }
    }
    
    this.addRequest(requestKey);
    
    const requestPromise = this.performFetchTasks();
    TaskCache.setCachePromise(requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.removeRequest(requestKey);
      TaskCache.clearCachePromise();
    }
  }

  /**
   * Performs the actual API call to fetch tasks
   */
  private static async performFetchTasks(): Promise<Task[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/getDefaultTasks`, {
        method: 'GET',
        headers: TaskUtils.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as ApiResponse;
      
      if (result.success) {
        const tasksWithDescription = result.data.map((task: Record<string, unknown>) => 
          TaskUtils.enforceDescription(task)
        );
        
        TaskCache.setCacheData(tasksWithDescription);
        return tasksWithDescription;
      } else {
        throw new Error('Failed to fetch tasks');
      }
    } catch (err) {
      TaskCache.invalidateCache();
      throw err;
    }
  }

  /**
   * Creates a new task
   */
  static async createTask(taskData: CreateTaskRequest): Promise<boolean> {
    const sanitizedData = TaskUtils.sanitizeTaskInput(taskData);
    const requestKey = TaskUtils.createRequestKey('createTask', sanitizedData.title);
    
    if (this.isRequestInProgress(requestKey)) {
      return false;
    }
    
    this.addRequest(requestKey);
    
    try {
      const response = await fetch(`${API_BASE_URL}/createDefault`, {
        method: 'POST',
        headers: TaskUtils.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          title: sanitizedData.title,
          description: sanitizedData.description,
          adminId: taskData.adminId
        }),
      });

      const result = await response.json() as CreateTaskResponse;
      
      if (result.success || (result.data && result.data.id)) {
        TaskCache.invalidateCache();
        return true;
      } else {
        // Verify if task was actually created
        const taskExists = await this.verifyTaskExists(sanitizedData.title);
        if (taskExists) {
          TaskCache.invalidateCache();
          return true;
        }
        throw new Error(result.message || 'Failed to add task');
      }
    } catch (err) {
      // Final verification attempt
      const taskExists = await this.verifyTaskExists(sanitizedData.title);
      if (taskExists) {
        TaskCache.invalidateCache();
        return true;
      }
      throw err;
    } finally {
      this.removeRequest(requestKey);
    }
  }

  /**
   * Updates an existing task
   */
  static async updateTask(id: string | number, taskData: UpdateTaskRequest): Promise<void> {
    const requestKey = TaskUtils.createRequestKey('editTask', id);
    
    if (this.isRequestInProgress(requestKey)) {
      return;
    }
    
    this.addRequest(requestKey);
    
    try {
      const response = await fetch(`${API_BASE_URL}/updateDefaultTask/${id}`, {
        method: 'PATCH',
        headers: TaskUtils.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(taskData),
      });

      const result = await response.json() as UpdateTaskResponse;
      
      if (result.success || response.ok) {
        TaskCache.invalidateCache();
      } else {
        throw new Error(result.message || 'Failed to update task');
      }
    } catch (err) {
      TaskCache.invalidateCache();
      throw err;
    } finally {
      this.removeRequest(requestKey);
    }
  }

  /**
   * Deletes a task
   */
  static async deleteTask(id: string | number): Promise<void> {
    const requestKey = TaskUtils.createRequestKey('deleteTask', id);
    
    if (this.isRequestInProgress(requestKey)) {
      return;
    }
    
    this.addRequest(requestKey);
    
    try {
      const response = await fetch(`${API_BASE_URL}/deleteDefaultTask/${id}`, {
        method: 'DELETE',
        headers: TaskUtils.getAuthHeaders(),
        credentials: 'include',
      });

      const result = await TaskUtils.parseJsonResponse<DeleteTaskResponse>(response);

      // If JSON parsing failed but response was ok, consider it successful
      if (!result && response.ok) {
        TaskCache.invalidateCache();
        return;
      }

      if (result && (result.success || response.ok)) {
        TaskCache.invalidateCache();
      } else {
        const statusText = response.statusText || 'Unknown error';
        throw new Error(result?.message || `Delete failed with status ${response.status}: ${statusText}`);
      }
    } catch (err) {
      TaskCache.invalidateCache();
      throw err;
    } finally {
      this.removeRequest(requestKey);
    }
  }

  /**
   * Verifies if a task exists by title
   */
  private static async verifyTaskExists(title: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/getDefaultTasks`, {
        method: 'GET',
        headers: TaskUtils.getAuthHeaders(),
        credentials: 'include',
      });
      
      if (response.ok) {
        const verifyResult = await response.json() as VerifyResponse;
        return verifyResult.data?.some((t: { title: string }) => t.title === title) || false;
      }
    } catch (error) {
      // Silently handle verification error
    }
    return false;
  }

  /**
   * Clears all ongoing requests (useful for cleanup)
   */
  static clearOngoingRequests(): void {
    this.ongoingRequests.clear();
  }
}

export default TaskApi;