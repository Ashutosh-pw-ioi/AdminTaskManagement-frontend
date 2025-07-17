interface EmployeeWorkload {
  name: string;
  totalTasks: number;
  completed: number;
  pending: number;
  inProgress: number;
}

const EmployeeWorkloadList: React.FC<{
  workloads: EmployeeWorkload[];
  title: string;
}> = ({ workloads, title }) => {
  return (
    <div className="rounded-lg p-6 border border-gray-700 bg-white">
      <h3 className="text-[#1B3A6A] text-sm font-medium mb-4">{title}</h3>
      <div className="space-y-4">
        {workloads.map((employee, index) => (
          <div
            key={index}
            className="border-b border-gray-600 pb-3 last:border-b-0"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-[#1B3A6A] font-medium">{employee.name}</h4>
              <span className="text-[#1B3A6A] text-sm">
                Total: {employee.totalTasks}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center text-[#1B3A6A]">
                <div className="font-medium">{employee.completed}</div>
                <div className="text-xs">Completed</div>
              </div>
              <div className="text-center text-[#1B3A6A]">
                <div className="font-medium">{employee.inProgress}</div>
                <div className="text-xs">In Progress</div>
              </div>
              <div className="text-center text-[#1B3A6A]">
                <div className="font-medium">{employee.pending}</div>
                <div className="text-xs">Pending</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeWorkloadList;
