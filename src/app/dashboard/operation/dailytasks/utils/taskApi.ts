import { ApiResponse, TaskStatus } from './taskTypes';
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


const API_BASE_URL =  `${API_URL}`;


const getApiConfig = () => ({
  credentials: 'include' as RequestCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🟢 Global cache
let dailyTasksCache: ApiResponse | null = null;

export const fetchDailyTasks = async (): Promise<ApiResponse> => {
  if (dailyTasksCache) return dailyTasksCache;

  const response = await fetch(`${API_BASE_URL}/api/operator/getdailyTasks`, {
    method: 'GET',
    ...getApiConfig(),
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const data: ApiResponse = await response.json();
  if (!data.success) throw new Error('API returned success: false');

  dailyTasksCache = data;
  return data;
};

export const updateTaskStatus = async (
  taskId: string,
  status: TaskStatus
): Promise<unknown> => {
  const response = await fetch(`${API_BASE_URL}/api/operator/updateDailyTask/${taskId}`, {
    method: 'PATCH',
    ...getApiConfig(),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  dailyTasksCache = null; // 🔥 Invalidate cache
  return await response.json();
};

export const bulkUpdateTasks = async (
  updates: Array<{ id: string; status: TaskStatus }>
): Promise<void> => {
  await Promise.all(updates.map(({ id, status }) => updateTaskStatus(id, status)));
  dailyTasksCache = null; // 🔥 Just in case
};
