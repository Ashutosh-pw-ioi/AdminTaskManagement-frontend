import type { Metadata } from "next";
import DefaultTasksSection from "./DefaultTasksSection";
import ProtectedRoute from "@/src/app/components/ProtectedRoutes";

export const metadata: Metadata = {
  title: "Create Default Tasks",
};

export default function Page() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DefaultTasksSection />
    </ProtectedRoute>
  );
}
