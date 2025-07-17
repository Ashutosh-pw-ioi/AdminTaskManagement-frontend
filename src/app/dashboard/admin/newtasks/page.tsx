import type { Metadata } from "next";
import NewTasksSection from "./NewTasksSection";
import ProtectedRoute from "@/src/app/components/ProtectedRoutes";

export const metadata: Metadata = {
  title: "Create Default Tasks",
};

export default function Page() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <NewTasksSection />
    </ProtectedRoute>
  );
}
