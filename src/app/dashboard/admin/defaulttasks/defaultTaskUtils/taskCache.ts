// utils/taskCache.ts
import { ApiCache, Task } from './types';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export let apiCache: ApiCache = {
  data: null,
  timestamp: 0,
  promise: null
};

export const isCacheValid = (): boolean => {
  const now = Date.now();
  return apiCache.data !== null && 
         (now - apiCache.timestamp) < CACHE_DURATION;
};

export const invalidateCache = (): void => {
  apiCache = { data: null, timestamp: 0, promise: null };
};

export const updateCache = (data: Task[]): void => {
  apiCache = {
    data,
    timestamp: Date.now(),
    promise: null
  };
};

export const setCachePromise = (promise: Promise<Task[]>): void => {
  apiCache.promise = promise;
};