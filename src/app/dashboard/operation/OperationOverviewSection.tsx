import React, { useState, useEffect } from "react";
import MetricCard from "../overviewComponents/MetricCard";
import BarChartComponent from "../overviewComponents/BarChartComponent";
import PieChartComponent from "../overviewComponents/PieChartComponent";
import WeeklyTrendChart from "../overviewComponents/WeeklyTrendChart";

const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
    // Add your auth token here if needed
    // 'Authorization': `Bearer ${token}`
  };
};

interface PriorityData {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
}

interface StatusData {
  PENDING: number;
  IN_PROGRESS: number;
  COMPLETED: number;
}

interface CompletionRateData {
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

const OperationOverviewSection: React.FC = () => {
  const [priorityData, setPriorityData] = useState<PriorityData | null>(null);
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [completionData, setCompletionData] = useState<CompletionRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Static data for weekly trend (as requested to keep it as is)
  const weeklyTrendData = [
    { day: "Mon", tasks: 18 },
    { day: "Tue", tasks: 22 },
    { day: "Wed", tasks: 15 },
    { day: "Thu", tasks: 20 },
    { day: "Fri", tasks: 25 },
    { day: "Sat", tasks: 10 },
    { day: "Sun", tasks: 5 },
  ];

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [priorityResponse, statusResponse, completionResponse] = await Promise.all([
          fetch('http://localhost:8000/api/operator/getPriorityCount', {
            method: 'GET',
            credentials: 'include',
            headers: getAuthHeaders(),
          }),
          fetch('http://localhost:8000/api/operator/getStatusCountDaily', {
            method: 'GET',
            credentials: 'include',
            headers: getAuthHeaders(),
          }),
          fetch('http://localhost:8000/api/operator/getCompletionRate', {
            method: 'GET',
            credentials: 'include',
            headers: getAuthHeaders(),
          }),
        ]);

        if (!priorityResponse.ok || !statusResponse.ok || !completionResponse.ok) {
          throw new Error('Failed to fetch data from one or more APIs');
        }

        const priorityResult = await priorityResponse.json();
        const statusResult = await statusResponse.json();
        const completionResult = await completionResponse.json();

        if (priorityResult.success) {
          setPriorityData(priorityResult.data);
        }

        if (statusResult.success) {
          setStatusData(statusResult.data);
        }

        if (completionResult.success) {
          setCompletionData(completionResult);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform priority data for bar chart
  const transformedPriorityData = priorityData ? [
    { category: "Low", value: priorityData.LOW },
    { category: "Medium", value: priorityData.MEDIUM },
    { category: "High", value: priorityData.HIGH },
  ] : [];

  // Transform status data for pie chart
  const transformedStatusData = statusData ? [
    { name: "Pending", value: statusData.PENDING },
    { name: "In Progress", value: statusData.IN_PROGRESS },
    { name: "Completed", value: statusData.COMPLETED },
  ] : [];

  // Transform completion data for metrics and task distribution
  const metrics = completionData ? [
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
  ] : [];

  // Task distribution data from completion breakdown
  const taskDistributionData = completionData ? [
    { name: "Daily Tasks", value: completionData.breakdown.daily.total },
    { name: "New Tasks", value: completionData.breakdown.new.total },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Admin Overview</h1>

        {/* Top 2 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 text-center gap-6 mb-4">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
            />
          ))}
        </div>

        {/* Two Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          <PieChartComponent
            data={taskDistributionData}
            title="Task Distribution"
          />
          <PieChartComponent 
            data={transformedStatusData} 
            title="Status Distribution" 
          />
        </div>

        {/* Bar Chart and Weekly Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          <BarChartComponent
            data={transformedPriorityData}
            title="Priority Distribution"
          />
          <WeeklyTrendChart data={weeklyTrendData} title="Weekly Task Trend" />
        </div>
      </div>
    </div>
  );
};

export default OperationOverviewSection;