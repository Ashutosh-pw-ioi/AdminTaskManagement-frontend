interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
}
const TeamGrid: React.FC<{ members: TeamMember[]; title: string }> = ({
  members,
  title,
}) => {
  return (
    <div className="rounded-lg p-6 border border-gray-700 bg-white">
      <h1 className="text-[#1B3A6A] text-xl font-medium mb-4">{title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="text-center p-4 bg-[#F1CB8D] rounded-lg py-10"
          >
            <div className="w-16 h-16 bg-[#1B3A6A] rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-lg font-semibold">
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>

            <p className="text-sm font-medium mb-1">{member.name}</p>
            <p className="text-xs mb-1">{member.role}</p>
            <p className="text-xs">{member.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamGrid;
