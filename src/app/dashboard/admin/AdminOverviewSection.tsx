import React from "react";

import MetricCard from "../overviewComponents/MetricCard";
import EmployeeWorkloadList from "../overviewComponents/EmployeeWorkload";
import BarChartComponent from "../overviewComponents/BarChartComponent";
import PieChartComponent from "../overviewComponents/PieChartComponent";
import TeamGrid from "../overviewComponents/TeamGrid";

const AdminOverviewSection: React.FC = () => {
  const metrics = [
    {
      title: "Total Tasks",
      value: "128",
      subtitle: "New + default tasks assigned",
    },
    {
      title: "Tasks Completed",
      value: "85",
      subtitle: "66.4% of assigned tasks are done",
    },
    {
      title: "Default Tasks",
      value: "32",
      subtitle: "Templates saved in deafult tasks",
    },
    {
      title: "Ops Members",
      value: "5",
      subtitle: "You have worked under you",
    },
  ];

  // Updated data for the left pie chart - Task Distribution
  const taskDistributionData = [
    { name: "New Tasks", value: 18 },
    { name: "Default Tasks", value: 27 },
  ];

  // Right pie chart data remains the same
  const statusData = [
    { name: "Pending", value: 12 },
    { name: "In Progress", value: 8 },
    { name: "Completed", value: 25 },
  ];

  const priorityData = [
    { category: "Low", value: 15 },
    { category: "Medium", value: 20 },
    { category: "High", value: 10 },
  ];

  const employeeWorkloads = [
    {
      name: "John Doe",
      totalTasks: 12,
      completed: 8,
      pending: 2,
      inProgress: 2,
    },
    {
      name: "Jane Smith",
      totalTasks: 15,
      completed: 10,
      pending: 3,
      inProgress: 2,
    },
    {
      name: "Mike Johnson",
      totalTasks: 8,
      completed: 5,
      pending: 2,
      inProgress: 1,
    },
    {
      name: "Sarah Wilson",
      totalTasks: 10,
      completed: 7,
      pending: 1,
      inProgress: 2,
    },
  ];

  const teamMembers = [
    {
      id: 1,
      name: "John Doe",
      role: "Developer",
      email: "john.doe@company.com",
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "Designer",
      email: "jane.smith@company.com",
    },
    {
      id: 3,
      name: "Mike Johnson",
      role: "Product Manager",
      email: "mike.johnson@company.com",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      role: "QA Engineer",
      email: "sarah.wilson@company.com",
    },
  ];

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
