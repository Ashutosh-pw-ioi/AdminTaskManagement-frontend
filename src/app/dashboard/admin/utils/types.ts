// types.ts
export interface TaskData {
  totalTasksToday: number;
  dailyTaskCount: number;
  newTaskCount: number;
}

export interface StatusCounts {
  PENDING: number;
  IN_PROGRESS: number;
  COMPLETED: number;
}

export interface PriorityCounts {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
}

export interface WorkloadData {
  name: string;
  pending: number;
  progress: number;
  completed: number;
  total: number;
}

export interface ApiCache {
  data: unknown;
  timestamp: number;
  ttl: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  totalTasksToday?: number;
  dailyTaskCount?: number;
  newTaskCount?: number;
  statusCounts?: StatusCounts;
  priorityCounts?: PriorityCounts;
}

export interface EmployeeWorkload {
  name: string;
  totalTasks: number;
  completed: number;
  pending: number;
  inProgress: number;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
}

export interface MetricCardData {
  title: string;
  value: string;
  subtitle: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface PriorityChartData {
  category: string;
  value: number;
}