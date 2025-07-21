import { 
  PriorityData, 
  StatusData, 
  CompletionRateData, 
  ChartDataItem, 
  WeeklyTrendDataItem, 
  MetricData 
} from './types';

export const transformPriorityData = (priorityData: PriorityData): ChartDataItem[] => [
  { category: "Low", value: priorityData.LOW },
  { category: "Medium", value: priorityData.MEDIUM },
  { category: "High", value: priorityData.HIGH },
];

export const transformStatusData = (statusData: StatusData): { name: string; value: number }[] => [
  { name: "Pending", value: statusData.PENDING },
  { name: "In Progress", value: statusData.IN_PROGRESS },
  { name: "Completed", value: statusData.COMPLETED },
];

export const transformTaskDistributionData = (completionData: CompletionRateData | null): { name: string; value: number }[] => {
  if (!completionData) {
    return [
      { name: "Daily Tasks", value: 0 },
      { name: "New Tasks", value: 0 },
    ];
  }

  return [
    { name: "Daily Tasks", value: completionData.breakdown.daily.total },
    { name: "New Tasks", value: completionData.breakdown.new.total },
  ];
};

export const generateMetricsData = (completionData: CompletionRateData | null): MetricData[] => {
  if (!completionData) {
    return [
      {
        title: "Total Tasks",
        value: "0",
        subtitle: "Daily + new tasks assigned",
      },
      {
        title: "Tasks Completed",
        value: "0",
        subtitle: "0.0% of assigned tasks are done",
      },
    ];
  }

  return [
    {
      title: "Total Tasks",
      value: completionData.totalTasks.toString(),
      subtitle: "Daily + new tasks assigned",
    },
    {
      title: "Tasks Completed",
      value: completionData.completedTasks.toString(),
      subtitle: `${completionData.completionRate.toFixed(1)}% of assigned tasks are done`,
    },
  ];
};

export const getWeeklyTrendData = (): WeeklyTrendDataItem[] => [
  { day: "Mon", tasks: 18 },
  { day: "Tue", tasks: 22 },
  { day: "Wed", tasks: 15 },
  { day: "Thu", tasks: 20 },
  { day: "Fri", tasks: 25 },
  { day: "Sat", tasks: 10 },
  { day: "Sun", tasks: 5 },
];