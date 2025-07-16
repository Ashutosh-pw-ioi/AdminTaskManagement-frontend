"use client";

import React from "react";
import { Clipboard, ArrowUpRight } from "lucide-react";

interface EmptyListProps {
  taskType: string;
}

export default function EmptyList({ taskType }: EmptyListProps) {
  return (
    <div className="h-full flex items-center justify-center pb-10">
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="w-16 h-16 bg-[#1B3A6A] rounded-full flex items-center justify-center mb-4">
          <Clipboard className="w-8 h-8 text-[#D4E3F5]" />
        </div>

        <h3 className="text-lg font-medium text-gray-800 mb-2">
          No {taskType} tasks created yet
        </h3>

        <p className="text-[#1B3A6A] mb-4">
          Click the <strong>Add Task</strong> button above to create {taskType}{" "}
          task
        </p>

        <div className="flex items-center text-sm">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          <span>Add Task button is in the top right corner</span>
        </div>
      </div>
    </div>
  );
}
