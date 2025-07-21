// createutils/hooks/useDailyTasks.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { TransformedTask } from "./types";
import { fetchTodayDailyTasks } from "./apiClient";
import { apiCache, isCacheValid, setCacheData, clearCache } from "./cache";
import { getErrorMessage } from "./errorHandlers";

export function useDailyTasks() {
  const [tasks, setTasks] = useState<TransformedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const fetchTasks = useCallback(async (forceRefresh = false) => {
    const currentRequestId = ++requestIdRef.current;

    try {
      setIsLoading(true);
      setError(null);

      // Check cache
      if (!forceRefresh && isCacheValid()) {
        setTasks(apiCache.data!);
        setIsLoading(false);
        return apiCache.data!;
      }

      // Use existing promise if available
      if (apiCache.promise && !forceRefresh) {
        const cachedResult = await apiCache.promise;
        if (mountedRef.current && currentRequestId === requestIdRef.current) {
          setTasks(cachedResult);
          setIsLoading(false);
        }
        return cachedResult;
      }

      // Make new API request
      const requestPromise = fetchTodayDailyTasks();
      apiCache.promise = requestPromise;

      const result = await requestPromise;
      setCacheData(result);
      
      if (mountedRef.current && currentRequestId === requestIdRef.current) {
        setTasks(result);
      }

      return result;

    } catch (err: unknown) {
      apiCache.promise = null;
      
      if (mountedRef.current && currentRequestId === requestIdRef.current) {
        setError(getErrorMessage(err));
        setTasks([]);
      }
      throw err;
    } finally {
      if (mountedRef.current && currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const refreshTasks = useCallback(() => {
    clearCache();
    return fetchTasks(true);
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasks();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchTasks]);

  return {
    tasks,
    isLoading,
    error,
    setTasks,
    setError,
    fetchTasks,
    refreshTasks
  };
}