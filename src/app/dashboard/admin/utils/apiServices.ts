// apiServices.ts
import { ApiResponse } from './types';
import { API_BASE_URL, fetchWithErrorHandling } from './apiUtils';
import { apiCache, CACHE_TTL } from './cacheUtils';

export const fetchTotalTasks = async (): Promise<ApiResponse> => {
  return apiCache.getOrFetch('totalTasks', async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/getTotalTasks`);
  }, CACHE_TTL.TASKS);
};

export const fetchStatusCounts = async (): Promise<ApiResponse> => {
  return apiCache.getOrFetch('statusCounts', async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/getDailyStatusCount`);
  }, CACHE_TTL.STATUS);
};

export const fetchPriorityCounts = async (): Promise<ApiResponse> => {
  return apiCache.getOrFetch('priorityCounts', async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/getPriorityCount`);
  }, CACHE_TTL.PRIORITY);
};

export const fetchOperators = async (): Promise<ApiResponse> => {
  return apiCache.getOrFetch('operators', async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/getOperators`);
  }, CACHE_TTL.OPERATORS);
};

export const fetchWorkloadData = async (): Promise<ApiResponse> => {
  return apiCache.getOrFetch('workloadData', async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/getAssigneeWorkload`);
  }, CACHE_TTL.WORKLOAD);
};