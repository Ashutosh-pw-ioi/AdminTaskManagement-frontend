"use client";

import React from "react";
import { Smile } from "lucide-react";

interface EmptyListProps {
  taskType: string;
}

export default function EmptyList({ taskType }: EmptyListProps) {
  const getCurrentDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return today.toLocaleDateString("en-US", options);
  };

  return (
    <div className="h-full flex items-center justify-center pb-10">
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="w-16 h-16 bg-[#1B3A6A] rounded-full flex items-center justify-center mb-3">
          <Smile className="w-8 h-8 text-[#D4E3F5]" />
        </div>

        <div className="text-3xl font-bold text-[#1B3A6A] mb-3">{getCurrentDate()}</div>

        <div className="text-md font-bold text-white bg-[#d8a864] px-4 py-2 rounded-md shadow-md">
          No <span className="underline">{taskType}</span> tasks assigned as of now
        </div>
      </div>
    </div>
  );
}
