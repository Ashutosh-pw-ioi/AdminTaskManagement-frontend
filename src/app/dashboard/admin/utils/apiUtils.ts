
import { ApiResponse } from './types';
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return process.env.REACT_APP_API_BASE_URL || `${API_URL}/api/admin`;
  }
  return process.env.API_BASE_URL || `${API_URL}/api/admin`;
};

export const API_BASE_URL = getApiBaseUrl();

export const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const fetchWithErrorHandling = async (url: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: "include"
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};