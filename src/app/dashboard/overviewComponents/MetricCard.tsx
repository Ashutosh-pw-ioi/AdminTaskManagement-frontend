interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle }) => {
  return (
    <div className="rounded-lg p-6 border border-gray-700 bg-white text-[#1B3A6A]">
      <h3 className="text-sm font-medium mb-1">{title}</h3>
      <div className="text-4xl font-bold mb-1">{value}</div>
      <p className="text-sm">{subtitle}</p>
    </div>
  );
};

export default MetricCard;
