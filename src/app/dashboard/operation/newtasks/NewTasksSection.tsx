"use client";

import React, { useState, useEffect } from "react";
import { NewTasks as InitialTasks } from "./NewTasks";
import EmptyList from "../EmptyList";
import SimpleTable from "../../Table/SimpleTable";

export default function NewTasksSection() {
  const [tasks, setTasks] = useState(InitialTasks);

  function enforceDescription(task: any): (typeof InitialTasks)[number] {
    return {
      ...task,
      description: task.description ?? "No description provided.",
    };
  }

  useEffect(() => {
    setTasks((prev) => prev.map((task) => enforceDescription(task)));
  }, []);

  return (
    <div className="p-4 relative">
      {tasks.length > 0 ? (
        <div className="w-full">
          <div className="text-3xl font-bold mb-8">Daily Tasks Management</div>
          <SimpleTable
            data={tasks}
            searchFields={[]}
            itemsPerPage={4}
            badgeFields={["priority", "assigned_to", "assigned_by"]}
            arrayFields={["assigned_to"]}
            dropdownFields={[
              {
                field: "status",
                options: [
                  { value: "pending", label: "Pending" },
                  { value: "in progress", label: "In Progress" },
                  { value: "completed", label: "Completed" },
                ],
              },
            ]}
          />
        </div>
      ) : (
        <div className="h-screen">
          <EmptyList taskType={"new"} />
        </div>
      )}
    </div>
  );
}
