import { stat } from 'fs';
import { NewTaskApiResponse, NewTaskUpdateResponse, NewTaskStatus } from './newTaskTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * API configuration
 */
const getApiConfig = () => ({
  credentials: 'include' as RequestCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 🗂️ Memoization cache for new tasks
 */
let newTasksCache: NewTaskApiResponse | null = null;
let newTasksPromise: Promise<NewTaskApiResponse> | null = null;
let cacheTimestamp: number = 0;

/**
 * Cache duration (5 minutes)status
 */
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Check if cache is still valid
 */
const isCacheValid = (): boolean => {
  return newTasksCache !== null && 
         (Date.now() - cacheTimestamp) < CACHE_DURATION;
};

/**
 * Clear the cache and promise
 */
const clearCache = (): void => {
  newTasksCache = null;
  newTasksPromise = null;
  cacheTimestamp = 0;
};

/**
 * Fetch new tasks with proper memoization
 * Prevents multiple simultaneous API calls and caches results
 */
export const fetchNewTasks = async (): Promise<NewTaskApiResponse> => {
  // ✅ Return cached data if still valid
  if (isCacheValid()) {
    return newTasksCache!;
  }

  // ✅ If there's already a pending request, return that promise
  if (newTasksPromise) {
    return newTasksPromise;
  }

  // ✅ Create new promise and cache it
  newTasksPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/operator/getnewTasks`, {
        method: 'GET',
        ...getApiConfig(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NewTaskApiResponse = await response.json();

      if (!data.success) {
        throw new Error('API returned success: false');
      }

      // ✅ Cache the successful result 
      newTasksCache = data;
      cacheTimestamp = Date.now();

      return data;
    } catch (error) {
      // ✅ Clear promise on error so next call can retry
      newTasksPromise = null;
      console.error('Error fetching new tasks:', error);
      throw error;
    }
  })();

  return newTasksPromise;
};

/**
 * Memoized update functions cache
 */
const updatePromiseCache = new Map<string, Promise<NewTaskUpdateResponse>>();

/**
 * Update new task status with memoization
 * Prevents duplicate update calls for the same task+status combination
 */
export const updateNewTaskStatus = async (
  taskId: string,
  status: NewTaskStatus
): Promise<NewTaskUpdateResponse> => {
  const cacheKey = `${taskId}-${status}`;

  // ✅ Return existing promise if update is already in progress
  if (updatePromiseCache.has(cacheKey)) {
    return updatePromiseCache.get(cacheKey)!;
  }

  // ✅ Create and cache the update promise
  const updatePromise = (async () => {
    try {
      const newStatus = status;
      console.log(`Updating task ${taskId} to status: ${newStatus}`);
      const response = await fetch(`${API_BASE_URL}/api/operator/updateNewTask/${taskId}`, {
        method: 'PATCH',
        ...getApiConfig(),
        body: JSON.stringify({ status: newStatus}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: NewTaskUpdateResponse = await response.json();

      if (!data.success) {
        throw new Error('API returned success: false');
      }

      // ✅ Clear fetch cache since data has changed
      clearCache();

      return data;
    } catch (error) {
      console.error('Error updating new task status:', error);
      throw error;
    } finally {
      // ✅ Remove from cache after completion (success or failure)
      updatePromiseCache.delete(cacheKey);
    }
  })();

  updatePromiseCache.set(cacheKey, updatePromise);
  return updatePromise;
};

/**
 * Bulk update new tasks with memoization
 * Deduplicates identical updates and batches them efficiently
 */
export const bulkUpdateNewTasks = async (
  updates: Array<{ id: string; status: NewTaskStatus }>
): Promise<void> => {
  // ✅ Deduplicate updates (keep the last status for each task)
  const deduplicatedUpdates = new Map<string, NewTaskStatus>();
  updates.forEach(({ id, status }) => {
    deduplicatedUpdates.set(id, status);
  });

  // ✅ Convert back to array and process
  const uniqueUpdates = Array.from(deduplicatedUpdates.entries()).map(
    ([id, status]) => ({ id, status })
  );

  const updatePromises = uniqueUpdates.map(({ id, status }) =>
    updateNewTaskStatus(id, status)
  );

  await Promise.all(updatePromises);

  // ✅ Ensure cache is cleared after bulk update
  clearCache();
};

/**
 * Force refresh - clears cache and fetches fresh data
 */
export const refreshNewTasks = async (): Promise<NewTaskApiResponse> => {
  clearCache();
  return fetchNewTasks();
};

/**
 * Get cached data without making API call (returns null if no cache)
 */
export const getCachedNewTasks = (): NewTaskApiResponse | null => {
  return isCacheValid() ? newTasksCache : null;
};

/**
 * Utility to manually clear cache (useful for debugging or forced refreshes)
 */
export const clearNewTasksCache = (): void => {
  clearCache();
};