"use client";

import React, { useState, useEffect } from "react";
import { DailyTasks as InitialTasks } from "../constants/DailyTasks";
import EmptyList from "../EmptyList";
import { Plus } from "lucide-react";
import SimpleTable from "../../Table/SimpleTable";
import AddTaskModal from "./AddTaskModal";

export default function DefaultTasksSection() {
  const [tasks, setTasks] = useState(InitialTasks);
  const [isAddModal, setIsAddModal] = useState(false);

  function enforceDescription(task: any): (typeof InitialTasks)[number] {
    return {
      ...task,
      description: task.description ?? "No description provided.",
    };
  }

  useEffect(() => {
    setTasks((prev) => prev.map((task) => enforceDescription(task)));
  }, []);

  const handleAddTask = (task: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    assigned_to: string[];
  }) => {
    const newTask = {
      id: tasks[tasks.length - 1].id + 1,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      assigned_to: task.assigned_to,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleAddClick = () => {
    setIsAddModal(true);
  };

  const handleEdit = (updatedTask: (typeof InitialTasks)[number]) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const handleDelete = (id: number | string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <div className="p-4 relative">
      {isAddModal && (
        <AddTaskModal
          isOpen={isAddModal}
          onClose={() => setIsAddModal(false)}
          onSubmit={handleAddTask}
        />
      )}
      <button
        className="fixed top-6 right-6 w-10 h-10 bg-[#1B3A6A] rounded-full flex items-center justify-center mb-4 cursor-pointer shadow-xl"
        onClick={handleAddClick}
      >
        <Plus className="w-5 h-5 text-[#D4E3F5]" />
      </button>

      {tasks.length > 0 ? (
        <div className="w-full">
          <div className="text-3xl font-bold mb-8">Daily Tasks Management</div>
          <SimpleTable
            data={tasks}
            onEdit={(item) => handleEdit(item as (typeof InitialTasks)[number])}
            onDelete={handleDelete}
            searchFields={["title", "description"]}
            itemsPerPage={4}
            badgeFields={["assigned_to", "status", "priority"]}
            arrayFields={["assigned_to"]}
          />
        </div>
      ) : (
        <div className="h-screen">
          <EmptyList taskType={"daily"} />
        </div>
      )}
    </div>
  );
}
