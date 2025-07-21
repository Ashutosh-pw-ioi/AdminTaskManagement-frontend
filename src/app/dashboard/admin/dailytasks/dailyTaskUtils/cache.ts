// createutils/cache.ts
import { ApiCache, TransformedTask } from "./types";
import { CACHE_DURATION } from "./constants";

export const apiCache: ApiCache = {
  data: null,
  timestamp: null,
  promise: null,
};

export const isCacheValid = (): boolean => {
  if (!apiCache.data || !apiCache.timestamp) return false;
  const cacheAge = Date.now() - apiCache.timestamp;
  return cacheAge < CACHE_DURATION;
};

export const setCacheData = (data: TransformedTask[]): void => {
  apiCache.data = data;
  apiCache.timestamp = Date.now();
  apiCache.promise = null;
};

export const clearCache = (): void => {
  apiCache.data = null;
  apiCache.timestamp = null;
  apiCache.promise = null;
};