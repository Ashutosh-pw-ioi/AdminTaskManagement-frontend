// dataTransformers.ts
import { 
  TaskData, 
  StatusCounts, 
  PriorityCounts, 
  WorkloadData,
  EmployeeWorkload,
  TeamMember,
  MetricCardData,
  ChartData,
  PriorityChartData
} from './types';

export const calculateCompletedPercentage = (totalTasks: number, completedTasks: number): string => {
  return totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0.0';
};

export const transformToMetrics = (
  taskData: TaskData,
  statusCounts: StatusCounts,
  operatorsCount: number,
  completedPercentage: string
): MetricCardData[] => [
  {
    title: "Total Tasks",
    value: taskData.totalTasksToday.toString(),
    subtitle: "Tasks assigned today",
  },
  {
    title: "Tasks Completed",
    value: statusCounts.COMPLETED.toString(),
    subtitle: `${completedPercentage}% of assigned tasks are done`,
  },
  {
    title: "Daily Tasks",
    value: taskData.dailyTaskCount.toString(),
    subtitle: "Daily recurring tasks",
  },
  {
    title: "Ops Members",
    value: operatorsCount.toString(),
    subtitle: "Operators working under you",
  },
];

export const transformToTaskDistributionData = (taskData: TaskData): ChartData[] => [
  { name: "Daily Tasks", value: taskData.dailyTaskCount },
  { name: "New Tasks", value: taskData.newTaskCount },
];

export const transformToStatusData = (statusCounts: StatusCounts): ChartData[] => [
  { name: "Pending", value: statusCounts.PENDING },
  { name: "In Progress", value: statusCounts.IN_PROGRESS },
  { name: "Completed", value: statusCounts.COMPLETED },
];

export const transformToPriorityData = (priorityCounts: PriorityCounts): PriorityChartData[] => [
  { category: "Low", value: priorityCounts.LOW },
  { category: "Medium", value: priorityCounts.MEDIUM },
  { category: "High", value: priorityCounts.HIGH },
];

export const transformToEmployeeWorkloads = (workloadData: WorkloadData[]): EmployeeWorkload[] =>
  workloadData.map(workload => ({
    name: workload.name,
    totalTasks: workload.total,
    completed: workload.completed,
    pending: workload.pending,
    inProgress: workload.progress,
  }));

export const transformToTeamMembers = (workloadData: WorkloadData[]): TeamMember[] =>
  workloadData.map((workload, index) => ({
    id: index + 1,
    name: workload.name,
    role: "Operator",
    email: `${workload.name.toLowerCase().replace(' ', '.')}@company.com`,
  }));