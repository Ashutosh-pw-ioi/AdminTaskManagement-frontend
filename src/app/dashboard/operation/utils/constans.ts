const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export const API_BASE_URL = `${API_URL}/api/operator`;

export const CACHE_TTL = {
  PRIORITY: 10 * 60 * 1000,
  STATUS: 2 * 60 * 1000,
  COMPLETION: 5 * 60 * 1000,
} as const;

export const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const CACHE_KEYS = {
  PRIORITY: 'operatorPriority',
  STATUS: 'operatorStatus',
  COMPLETION: 'operatorCompletion',
} as const;