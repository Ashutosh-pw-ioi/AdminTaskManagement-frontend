"use client";

import React, { useState } from "react";
import { DefaultTasks } from "../constants/DefaultTasks";
import EmptyList from "./EmptyList";
import { Plus } from "lucide-react";

export default function DefaultTasksSection() {
  return (
    <div className="p-2 h-screen">
      <button className="fixed top-6 right-6 w-10 h-10 bg-[#1B3A6A] rounded-full flex items-center justify-center mb-4 cursor-pointer shadow-xl">
        <Plus className="w-5 h-5 text-[#D4E3F5]" />
      </button>
      {DefaultTasks.length > 0 ? <div>Default Tasks</div> : <EmptyList />}
    </div>
  );
}
