import { ApiResponse, PriorityData, StatusData, CompletionRateData } from './types';
import { API_BASE_URL, CACHE_TTL, CACHE_KEYS } from '../utils/constans';
import { apiCache } from './apiCache';

export const getAuthHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
  };
};

export const fetchPriorityData = async (): Promise<ApiResponse<PriorityData>> => {
  return apiCache.getOrFetch(CACHE_KEYS.PRIORITY, async () => {
    const response = await fetch(`${API_BASE_URL}/getPriorityCount`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: "include"
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }, CACHE_TTL.PRIORITY);
};

export const fetchStatusData = async (): Promise<ApiResponse<StatusData>> => {
  return apiCache.getOrFetch(CACHE_KEYS.STATUS, async () => {
    const response = await fetch(`${API_BASE_URL}/getStatusCountDaily`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: "include"
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }, CACHE_TTL.STATUS);
};

export const fetchCompletionData = async (): Promise<ApiResponse<CompletionRateData>> => {
  return apiCache.getOrFetch(CACHE_KEYS.COMPLETION, async () => {
    const response = await fetch(`${API_BASE_URL}/getCompletionRate`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: "include"
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }, CACHE_TTL.COMPLETION);
};