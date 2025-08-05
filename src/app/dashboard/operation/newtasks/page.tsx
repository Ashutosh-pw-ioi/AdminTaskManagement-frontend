import type { Metadata } from "next";
import NewTasksSection from "./NewTasksSection";

export const metadata: Metadata = {
  title: "Create Default Tasks",
};

export default function Page() {
  return <NewTasksSection />;
}
