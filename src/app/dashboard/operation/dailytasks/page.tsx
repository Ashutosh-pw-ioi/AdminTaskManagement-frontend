import type { Metadata } from "next";
import DailyTasksSection from "./DailyTasksSection";

export const metadata: Metadata = {
  title: "Create Default Tasks",
};

export default function Page() {
  return <DailyTasksSection />;
}
