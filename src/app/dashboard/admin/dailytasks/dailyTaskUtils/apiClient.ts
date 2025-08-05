// createutils/apiClient.ts
import { API_BASE_URL } from "./constants";
import { TaskFromAPI, TransformedTask, FormTask } from "./types";
import { handleApiError } from "./errorHandlers";
import { transformApiTasks } from "./dataTransformers";

const createApiRequest = (endpoint: string, options: RequestInit = {}) => {
  return fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
};

export const fetchTodayDailyTasks = async (): Promise<TransformedTask[]> => {
  const response = await createApiRequest("/getTodayDailyTasks", {
    method: "GET",
  });

  if (!response.ok) {
    throw handleApiError(response);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || "Failed to fetch tasks");
  }

  return transformApiTasks(data.data);
};

export const createDailyTask = async (task: FormTask): Promise<void> => {
  const requestBody = {
    defaultTaskId: task.defaultTaskId,
    operatorIds: task.operatorIds,
    priority: task.priority,
    status: task.status,
  };

  const response = await createApiRequest("/createDailyTask", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw handleApiError(response);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || "Failed to create task");
  }
};

export const updateDailyTask = async (updatedTask: TransformedTask): Promise<void> => {
  const requestBody = {
    priority: updatedTask.priority,
    operatorIds: updatedTask.operatorIds,
  };

  const response = await createApiRequest(`/updateDailyTask/${updatedTask.id}`, {
    method: "PATCH",
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw handleApiError(response);
  }

  const result = await response.json();
  
  if (!result.success && !response.ok) {
    throw new Error(result.message || "Failed to update task");
  }
};

export const deleteDailyTask = async (id: string | number): Promise<void> => {
  const response = await createApiRequest(`/deleteDailyTask/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw handleApiError(response);
  }
};