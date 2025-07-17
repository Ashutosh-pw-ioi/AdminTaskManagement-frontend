import type { Metadata } from "next";
import DefaultTasksSection from "./DefaultTasksSection";

export const metadata: Metadata = {
  title: "Create Default Tasks",
};

export default function Page() {
  return <DefaultTasksSection />;
}
