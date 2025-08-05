import { useState, useEffect, useCallback, useRef } from 'react';
import { PriorityData, StatusData, CompletionRateData } from './types';
import { fetchPriorityData, fetchStatusData, fetchCompletionData } from './apiService';
import { apiCache } from './apiCache';
import { REFRESH_INTERVAL, CACHE_KEYS } from './constans';

interface UseDataFetcherReturn {
  priorityData: PriorityData;
  statusData: StatusData;
  completionData: CompletionRateData | null;
  loading: boolean;
  error: string | null;
  handleRefresh: () => void;
  isFetching: boolean;
}

export const useDataFetcher = (): UseDataFetcherReturn => {
  const [priorityData, setPriorityData] = useState<PriorityData>({
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0
  });
  const [statusData, setStatusData] = useState<StatusData>({
    PENDING: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0
  });
  const [completionData, setCompletionData] = useState<CompletionRateData | null>(null);


  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const isFetchingRef = useRef<boolean>(false);
  const isInitializedRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchAllData = useCallback(async (forceRefresh = false): Promise<void> => {
    if (isFetchingRef.current && !forceRefresh) {
      return;
    }

    if (forceRefresh) {
      apiCache.clear();
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        fetchPriorityData(),
        fetchStatusData(),
        fetchCompletionData()
      ]);

      if (!mountedRef.current) return;

      const [priorityResult, statusResult, completionResult] = results;
      

      if (priorityResult.status === 'fulfilled' && priorityResult.value.success) {
        setPriorityData(priorityResult.value.data);
      }

      if (statusResult.status === 'fulfilled' && statusResult.value.success) {
        setStatusData(statusResult.value.data);
      }

      if (completionResult.status === 'fulfilled' && completionResult.status) {
        setCompletionData(completionResult.value);
      }

      const failedRequests = results.filter(result => result.status === 'rejected');
      if (failedRequests.length === results.length) {
        throw new Error('All API requests failed');
      }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      if (mountedRef.current) {
        setError('Failed to fetch data from the server');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      fetchAllData();
    }

    const refreshInterval = setInterval(() => {
      if (mountedRef.current && !isFetchingRef.current) {
        fetchAllData();
      }
    }, REFRESH_INTERVAL);

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible' && mountedRef.current && !isFetchingRef.current) {
        const priorityCached = apiCache.getCachedData(CACHE_KEYS.PRIORITY);
        const statusCached = apiCache.getCachedData(CACHE_KEYS.STATUS);
        const completionCached = apiCache.getCachedData(CACHE_KEYS.COMPLETION);
        
        if (!priorityCached || !statusCached || !completionCached) {
          fetchAllData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchAllData]);

  const handleRefresh = useCallback((): void => {
    fetchAllData(true);
  }, [fetchAllData]);

  return {
    priorityData,
    statusData,
    completionData,
    loading,
    error,
    handleRefresh,
    isFetching: isFetchingRef.current
  };
};