import React from "react";

import MetricCard from "../overviewComponents/MetricCard";
import BarChartComponent from "../overviewComponents/BarChartComponent";
import PieChartComponent from "../overviewComponents/PieChartComponent";
import WeeklyTrendChart from "../overviewComponents/WeeklyTrendChart";

const OperationOverviewSection: React.FC = () => {
  const weeklyTrendData = [
    { day: "Mon", tasks: 18 },
    { day: "Tue", tasks: 22 },
    { day: "Wed", tasks: 15 },
    { day: "Thu", tasks: 20 },
    { day: "Fri", tasks: 25 },
    { day: "Sat", tasks: 10 },
    { day: "Sun", tasks: 5 },
  ];

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
          <PieChartComponent data={statusData} title="Status Distribution" />
        </div>

        {/* Bar Chart and Weekly Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          <BarChartComponent
            data={priorityData}
            title="Priority Distribution"
          />
          <WeeklyTrendChart data={weeklyTrendData} title="Weekly Task Trend" />
        </div>
      </div>
    </div>
  );
};

export default OperationOverviewSection;
