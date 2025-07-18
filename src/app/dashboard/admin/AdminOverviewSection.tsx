import React, { useState, useEffect } from "react";
import MetricCard from "../overviewComponents/MetricCard";
import EmployeeWorkloadList from "../overviewComponents/EmployeeWorkload";
import BarChartComponent from "../overviewComponents/BarChartComponent";
import PieChartComponent from "../overviewComponents/PieChartComponent";
import TeamGrid from "../overviewComponents/TeamGrid";

const API_BASE_URL = "http://localhost:8000/api/admin";

// Auth headers function (adjust based on your auth implementation)
const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
    // Add your auth token here if needed
    // 'Authorization': `Bearer ${token}`
  };
};

interface TaskData {
  totalTasksToday: number;
  dailyTaskCount: number;
  newTaskCount: number;
}

interface StatusCounts {
  PENDING: number;
  IN_PROGRESS: number;
  COMPLETED: number;
}

interface PriorityCounts {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
}

interface Operator {
  id: string;
  name: string;
}

interface WorkloadData {
  name: string;
  pending: number;
  progress: number;
  completed: number;
  total: number;
}

const AdminOverviewSection: React.FC = () => {
  const [taskData, setTaskData] = useState<TaskData>({
    totalTasksToday: 0,
    dailyTaskCount: 0,
    newTaskCount: 0
  });
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    PENDING: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0
  });
  const [priorityCounts, setPriorityCounts] = useState<PriorityCounts>({
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0
  });
  const [operatorsCount, setOperatorsCount] = useState<number>(0);
  const [workloadData, setWorkloadData] = useState<WorkloadData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch total tasks
        const tasksResponse = await fetch(`${API_BASE_URL}/getTotalTasks`, {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: "include"
        });
        const tasksData = await tasksResponse.json();
        if (tasksData.success) {
          setTaskData({
            totalTasksToday: tasksData.totalTasksToday,
            dailyTaskCount: tasksData.dailyTaskCount,
            newTaskCount: tasksData.newTaskCount
          });
        }

        // Fetch status counts
        const statusResponse = await fetch(`${API_BASE_URL}/getDailyStatusCount`, {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: "include"
        });
        const statusData = await statusResponse.json();
        if (statusData.success) {
          setStatusCounts(statusData.statusCounts);
        }

        // Fetch priority counts
        const priorityResponse = await fetch(`${API_BASE_URL}/getPriorityCount`, {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: "include"
        });
        const priorityData = await priorityResponse.json();
        if (priorityData.success) {
          setPriorityCounts(priorityData.priorityCounts);
        }

        // Fetch operators count
        const operatorsResponse = await fetch(`${API_BASE_URL}/getOperators`, {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: "include"
        });
        const operatorsData = await operatorsResponse.json();
        if (operatorsData.success) {
          setOperatorsCount(operatorsData.data.length);
        }

        // Fetch workload data
        const workloadResponse = await fetch(`${API_BASE_URL}/getAssigneeWorkload`, {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: "include"
        });
        const workloadResponseData = await workloadResponse.json();
        if (workloadResponseData.success) {
          setWorkloadData(workloadResponseData.data);
        }

      } catch (err) {
        setError('Failed to fetch data from the server');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Calculate completed tasks percentage
  const totalTasks = taskData.totalTasksToday;
  const completedTasks = statusCounts.COMPLETED;
  const completedPercentage = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0.0';

  // Metrics data using API data
  const metrics = [
    {
      title: "Total Tasks",
      value: taskData.totalTasksToday.toString(),
      subtitle: "Tasks assigned today",
    },
    {
      title: "Tasks Completed",
      value: completedTasks.toString(),
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

  // Task Distribution data using API data
  const taskDistributionData = [
    { name: "Daily Tasks", value: taskData.dailyTaskCount },
    { name: "New Tasks", value: taskData.newTaskCount },
  ];

  // Status Distribution data using API data
  const statusData = [
    { name: "Pending", value: statusCounts.PENDING },
    { name: "In Progress", value: statusCounts.IN_PROGRESS },
    { name: "Completed", value: statusCounts.COMPLETED },
  ];

  // Priority Distribution data using API data
  const priorityData = [
    { category: "Low", value: priorityCounts.LOW },
    { category: "Medium", value: priorityCounts.MEDIUM },
    { category: "High", value: priorityCounts.HIGH },
  ];

  // Employee Workloads data using API data
  const employeeWorkloads = workloadData.map(workload => ({
    name: workload.name,
    totalTasks: workload.total,
    completed: workload.completed,
    pending: workload.pending,
    inProgress: workload.progress,
  }));

  // Team Members data using API data
  const teamMembers = workloadData.map((workload, index) => ({
    id: index + 1,
    name: workload.name,
    role: "Operator", // You might want to add role data to your API
    email: `${workload.name.toLowerCase().replace(' ', '.')}@company.com`, // Generated email
  }));

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
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

        {/* Top 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
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
          <PieChartComponent data={statusData} title="Status Distribution" />
        </div>

        {/* Bar Chart and Employee Workload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          <BarChartComponent
            data={priorityData}
            title="Priority Distribution"
          />
          <EmployeeWorkloadList
            workloads={employeeWorkloads}
            title="Employee Workload"
          />
        </div>

        <div className="mb-4">
          <TeamGrid members={teamMembers} title="Team Members" />
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewSection;