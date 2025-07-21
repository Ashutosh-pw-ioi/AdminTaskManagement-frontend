// useAdminData.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { TaskData, StatusCounts, PriorityCounts, WorkloadData } from './types';
import { 
  fetchTotalTasks, 
  fetchStatusCounts, 
  fetchPriorityCounts, 
  fetchOperators, 
  fetchWorkloadData 
} from './apiServices';
import { apiCache } from './cacheUtils';

interface UseAdminDataReturn {
  taskData: TaskData;
  statusCounts: StatusCounts;
  priorityCounts: PriorityCounts;
  operatorsCount: number;
  workloadData: WorkloadData[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  isFetching: boolean;
}

export const useAdminData = (): UseAdminDataReturn => {
  const [taskData, setTaskData] = useState<TaskData>({
    totalTasksToday: 0,
    dailyTaskCount: 0,
    newTaskCount: 0
  });
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    PENDING: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0
  });
  const [priorityCounts, setPriorityCounts] = useState<PriorityCounts>({
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0
  });
  const [operatorsCount, setOperatorsCount] = useState<number>(0);
  const [workloadData, setWorkloadData] = useState<WorkloadData[]>([]);
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
        fetchTotalTasks(),
        fetchStatusCounts(),
        fetchPriorityCounts(),
        fetchOperators(),
        fetchWorkloadData()
      ]);

      if (!mountedRef.current) return;

      const [tasksResult, statusResult, priorityResult, operatorsResult, workloadResult] = results;

      if (tasksResult.status === 'fulfilled' && tasksResult.value.success) {
        setTaskData({
          totalTasksToday: tasksResult.value.totalTasksToday || 0,
          dailyTaskCount: tasksResult.value.dailyTaskCount || 0,
          newTaskCount: tasksResult.value.newTaskCount || 0
        });
      }

      if (statusResult.status === 'fulfilled' && statusResult.value.success && statusResult.value.statusCounts) {
        setStatusCounts(statusResult.value.statusCounts);
      }

      if (priorityResult.status === 'fulfilled' && priorityResult.value.success && priorityResult.value.priorityCounts) {
        setPriorityCounts(priorityResult.value.priorityCounts);
      }

      if (operatorsResult.status === 'fulfilled' && operatorsResult.value.success && operatorsResult.value.data) {
        setOperatorsCount(Array.isArray(operatorsResult.value.data) ? operatorsResult.value.data.length : 0);
      }

      if (workloadResult.status === 'fulfilled' && workloadResult.value.success && workloadResult.value.data) {
        setWorkloadData(Array.isArray(workloadResult.value.data) ? workloadResult.value.data : []);
      }

      const failedRequests = results.filter(result => result.status === 'rejected');
      if (failedRequests.length === results.length) {
        throw new Error('All API requests failed');
      }

    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data from the server');
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
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [fetchAllData]);

  const refresh = useCallback(() => {
    fetchAllData(true);
  }, [fetchAllData]);

  return {
    taskData,
    statusCounts,
    priorityCounts,
    operatorsCount,
    workloadData,
    loading,
    error,
    refresh,
    isFetching: isFetchingRef.current
  };
};