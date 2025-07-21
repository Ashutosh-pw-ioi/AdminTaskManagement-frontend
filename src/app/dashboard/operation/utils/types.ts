export interface PriorityData {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
}

export interface StatusData {
  PENDING: number;
  IN_PROGRESS: number;
  COMPLETED: number;
}

export interface CompletionRateData {
  operatorId: string;
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  breakdown: {
    daily: {
      total: number;
      completed: number;
    };
    new: {
      total: number;
      completed: number;
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiCache {
  data: unknown;
  timestamp: number;
  ttl: number;
}

export interface ChartDataItem {
  category: string;
  name?: string;
  value: number;
}

export interface WeeklyTrendDataItem {
  day: string;
  tasks: number;
}

export interface MetricData {
  title: string;
  value: string;
  subtitle: string;
}