import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeeklyData {
  day: string;
  tasks: number;
}

interface WeeklyTrendChartProps {
  data: WeeklyData[];
  title: string;
}

const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({ data, title }) => {
  return (
    <div className="rounded-lg p-6 border border-gray-700 bg-white">
      <h3 className="text-[#1B3A6A] text-sm font-medium mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={370} className="pt-4">
        <LineChart data={data} className="-ml-4">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="day"
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            axisLine={{ stroke: "#4B5563" }}
          />
          <YAxis
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            axisLine={{ stroke: "#4B5563" }}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="tasks"
            stroke="#486AA0"
            strokeWidth={3}
            dot={{ r: 4, stroke: "#486AA0", strokeWidth: 2, fill: "#fff" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyTrendChart;
