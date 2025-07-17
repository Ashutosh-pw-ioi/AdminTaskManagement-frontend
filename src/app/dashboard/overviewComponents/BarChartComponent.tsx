import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface BarChartData {
  category: string;
  value: number;
}
const BarChartComponent: React.FC<{ data: BarChartData[]; title: string }> = ({
  data,
  title,
}) => {
  return (
    <div className="rounded-lg p-6 border border-gray-700 bg-white">
      <h3 className="text-[#1B3A6A] text-sm font-medium mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={370} className={"pt-4"}>
        <BarChart data={data} className="-ml-4">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="category"
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            axisLine={{ stroke: "#4B5563" }}
          />
          <YAxis
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            axisLine={{ stroke: "#4B5563" }}
          />
          <Bar dataKey="value" fill="#486AA0" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
