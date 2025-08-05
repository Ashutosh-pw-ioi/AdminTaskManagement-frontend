import React, { useMemo } from "react";
import MetricCard from "../overviewComponents/MetricCard";
import BarChartComponent from "../overviewComponents/BarChartComponent";
import PieChartComponent from "../overviewComponents/PieChartComponent";


// Utils imports
import { useDataFetcher } from "./utils/useDataFetcher";
import { 
  transformPriorityData, 
  transformStatusData, 
  transformTaskDistributionData, 
  generateMetricsData, 
 
} from "./utils/dataUtils";
import { LoadingComponent, ErrorComponent, RefreshButton } from "./utils/uiComponents";

const OperationOverviewSection: React.FC = () => {
  const {
    priorityData,
    statusData,
    completionData,
    loading,
    error,
    handleRefresh,
    isFetching
  } = useDataFetcher();

 

  const transformedPriorityData = useMemo(() => 
    transformPriorityData(priorityData), 
    [priorityData]
  );

  const transformedStatusData = useMemo(() => 
    transformStatusData(statusData), 
    [statusData]
  );

  const metrics = useMemo(() => 
    generateMetricsData(completionData), 
    [completionData]
  );

  const taskDistributionData = useMemo(() => 
    transformTaskDistributionData(completionData), 
    [completionData]
  );

  if (loading) {
    return <LoadingComponent />;
  }

  if (error) {
    return (
      <ErrorComponent 
        error={error} 
        onRetry={handleRefresh} 
        isRetrying={isFetching} 
      />
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mt-5 sm:mt-0 mb-4">
          <h1 className="text-3xl font-bold">Operation Overview</h1>
          <RefreshButton 
            onRefresh={handleRefresh} 
            isRefreshing={isFetching} 
          />
        </div>

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

        <div className="grid grid-cols-1 gap-6 mb-4">
          <BarChartComponent
            data={transformedPriorityData}
            title="Priority Distribution"
          />
          {/* <WeeklyTrendChart data={weeklyTrendData} title="Weekly Task Trend" /> */}
        </div>
      </div>
    </div>
  );
};

export default OperationOverviewSection;