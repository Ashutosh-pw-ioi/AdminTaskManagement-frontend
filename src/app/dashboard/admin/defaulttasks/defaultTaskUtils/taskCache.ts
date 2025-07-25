import { Task, ApiCache } from './types';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Global cache instance
let apiCache: ApiCache = {
  data: null,
  timestamp: 0,
  promise: null
};

export class TaskCache {
  static isCacheValid(): boolean {
    const now = Date.now();
    return apiCache.data !== null && 
           (now - apiCache.timestamp) < CACHE_DURATION;
  }

  static getCachedData(): Task[] | null {
    return this.isCacheValid() ? apiCache.data : null;
  }

  static setCacheData(data: Task[]): void {
    apiCache = {
      data,
      timestamp: Date.now(),
      promise: null
    };
  }

  static getCachePromise(): Promise<Task[]> | null {
    return apiCache.promise;
  }

  static setCachePromise(promise: Promise<Task[]>): void {
    apiCache.promise = promise;
  }

  static invalidateCache(): void {
    apiCache = { 
      data: null, 
      timestamp: 0, 
      promise: null 
    };
  }

  static clearCachePromise(): void {
    apiCache.promise = null;
  }
}

export default TaskCache;