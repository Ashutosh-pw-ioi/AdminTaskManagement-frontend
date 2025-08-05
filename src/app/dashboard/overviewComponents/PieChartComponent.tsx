import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ChartData {
  name: string;
  value: number;
}
const PieChartComponent: React.FC<{ data: ChartData[]; title: string }> = ({
  data,
  title,
}) => {
  const COLORS = ["#1B3A6A", "#D9A864", "#7695CD", "#FFD990"];

  return (
    <div className="rounded-lg p-6 border border-gray-700 bg-white">
      <h3 className="text-[#1B3A6A] text-sm font-medium mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;
