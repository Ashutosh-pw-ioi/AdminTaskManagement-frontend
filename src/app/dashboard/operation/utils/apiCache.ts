import { ApiCache } from './types';

export class APICache {
  private cache = new Map<string, ApiCache>();
  private pendingRequests = new Map<string, Promise<unknown>>();

  getCachedData(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key: string, data: unknown, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  async getOrFetch<T>(key: string, fetchFunction: () => Promise<T>, ttl: number): Promise<T> {
    const cached = this.getCachedData(key);
    if (cached) {
      return cached as T;
    }

    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    const request = fetchFunction()
      .then((data) => {
        this.setCachedData(key, data, ttl);
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, request);
    return request;
  }

  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

export const apiCache = new APICache();