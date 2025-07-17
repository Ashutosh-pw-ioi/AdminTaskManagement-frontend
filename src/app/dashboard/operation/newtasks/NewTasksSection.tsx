"use client";

import React, { useState, useEffect } from "react";
import { NewTasks as InitialTasks } from "./NewTasks";
import EmptyList from "../EmptyList";
import SimpleTable from "../../Table/SimpleTable";

type Task = {
  id: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  assigned_by: string;
  due_date: string;
  assigned_to: string[];
};

export default function NewTasksSection() {
  const [tasks, setTasks] = useState<Task[]>(InitialTasks);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [isOverdueCollapsed, setIsOverdueCollapsed] = useState<boolean>(true);
  const [isCompletedCollapsed, setIsCompletedCollapsed] =
    useState<boolean>(true);

  function enforceDescription(task: Task): Task {
    return {
      ...task,
      description: task.description ?? "No description provided.",
    };
  }

  function splitTasksByDueDate(tasks: Task[]): {
    upcoming: Task[];
    overdue: Task[];
    completed: Task[];
  } {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); 

    const upcoming: Task[] = [];
    const overdue: Task[] = [];
    const completed: Task[] = [];

    tasks.forEach((task: Task) => {
      const taskDueDate = new Date(task.due_date);
      taskDueDate.setHours(0, 0, 0, 0);

      if (taskDueDate >= currentDate) {
        upcoming.push(task);
      } else {
        if (task.status === "completed") {
          completed.push(task);
        } else if (task.status === "in progress" || task.status === "pending") {
          overdue.push(task);
        }
      }
    });

    return { upcoming, overdue, completed };
  }

  useEffect(() => {
    const processedTasks = InitialTasks.map((task) => enforceDescription(task));
    setTasks(processedTasks);

    const { upcoming, overdue, completed } =
      splitTasksByDueDate(processedTasks);
    setUpcomingTasks(upcoming);
    setOverdueTasks(overdue);
    setCompletedTasks(completed);
  }, []);

  const tableProps = {
    searchFields: [],
    itemsPerPage: 4,
    badgeFields: ["priority", "assigned_to", "assigned_by"],
    arrayFields: ["assigned_to"],
    dropdownFields: [
      {
        field: "status",
        options: [
          { value: "pending", label: "Pending" },
          { value: "in progress", label: "In Progress" },
          { value: "completed", label: "Completed" },
        ],
      },
    ],
  };

  return (
    <div className="p-4 relative">
      {tasks.length > 0 ? (
        <div className="w-full space-y-8">
          <div className="text-3xl font-bold mb-8">New Tasks Management</div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h2 className="text-2xl font-semibold mb-4 text-green-800">
              Upcoming Tasks ({upcomingTasks.length})
            </h2>
            {upcomingTasks.length > 0 ? (
              <SimpleTable data={upcomingTasks} {...tableProps} />
            ) : (
              <p className="text-green-600 italic">No upcoming tasks</p>
            )}
          </div>

          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsOverdueCollapsed(!isOverdueCollapsed)}
            >
              <h2 className="text-2xl font-semibold text-red-800">
                Overdue Tasks ({overdueTasks.length})
              </h2>
              <span className="text-red-600 text-xl">
                {isOverdueCollapsed ? "▼" : "▲"}
              </span>
            </div>
            {!isOverdueCollapsed && (
              <div className="mt-4">
                {overdueTasks.length > 0 ? (
                  <SimpleTable data={overdueTasks} {...tableProps} />
                ) : (
                  <p className="text-red-600 italic">No overdue tasks</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsCompletedCollapsed(!isCompletedCollapsed)}
            >
              <h2 className="text-2xl font-semibold text-blue-800">
                Completed Tasks ({completedTasks.length})
              </h2>
              <span className="text-blue-600 text-xl">
                {isCompletedCollapsed ? "▼" : "▲"}
              </span>
            </div>
            {!isCompletedCollapsed && (
              <div className="mt-4">
                {completedTasks.length > 0 ? (
                  <SimpleTable data={completedTasks} {...tableProps} />
                ) : (
                  <p className="text-blue-600 italic">No completed tasks</p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-screen">
          <EmptyList taskType={"new"} />
        </div>
      )}
    </div>
  );
}
