// AdminOverviewSection.tsx
import React, { useMemo } from "react";
import MetricCard from "../overviewComponents/MetricCard";
import EmployeeWorkloadList from "../overviewComponents/EmployeeWorkload";
import BarChartComponent from "../overviewComponents/BarChartComponent";
import PieChartComponent from "../overviewComponents/PieChartComponent";
import TeamGrid from "../overviewComponents/TeamGrid";

// Utility imports
import { useAdminData } from "./utils/useAdminData";
import { LoadingSpinner, ErrorDisplay, RefreshButton } from "./utils/UIComponents";
import {
  calculateCompletedPercentage,
  transformToMetrics,
  transformToTaskDistributionData,
  transformToStatusData,
  transformToPriorityData,
  transformToEmployeeWorkloads,
  transformToTeamMembers
} from "./utils/dataTransfromers";

const AdminOverviewSection: React.FC = () => {
  const {
    taskData,
    statusCounts,
    priorityCounts,
    operatorsCount,
    workloadData,
    loading,
    error,
    refresh,
    isFetching
  } = useAdminData();

  const completedPercentage = useMemo(() => 
    calculateCompletedPercentage(taskData.totalTasksToday, statusCounts.COMPLETED),
    [taskData.totalTasksToday, statusCounts.COMPLETED]
  );

  const metrics = useMemo(() => 
    transformToMetrics(taskData, statusCounts, operatorsCount, completedPercentage),
    [taskData, statusCounts, operatorsCount, completedPercentage]
  );

  const taskDistributionData = useMemo(() => 
    transformToTaskDistributionData(taskData),
    [taskData]
  );

  const statusData = useMemo(() => 
    transformToStatusData(statusCounts),
    [statusCounts]
  );

  const priorityData = useMemo(() => 
    transformToPriorityData(priorityCounts),
    [priorityCounts]
  );

  const employeeWorkloads = useMemo(() => 
    transformToEmployeeWorkloads(workloadData),
    [workloadData]
  );

  const teamMembers = useMemo(() => 
    transformToTeamMembers(workloadData),
    [workloadData]
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refresh} isRetrying={isFetching} />;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Admin Overview</h1>
          <RefreshButton onRefresh={refresh} isRefreshing={isFetching} />
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          <PieChartComponent
            data={taskDistributionData}
            title="Task Distribution"
          />
          <PieChartComponent data={statusData} title="Status Distribution" />
        </div>

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