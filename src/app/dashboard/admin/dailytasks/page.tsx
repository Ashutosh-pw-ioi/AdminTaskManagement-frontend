import type { Metadata } from "next";
import DailyTasksSection from "./DailyTasksSection";
import ProtectedRoute from "@/src/app/components/ProtectedRoutes";

export const metadata: Metadata = {
  title: "Create Default Tasks",
};

export default function Page() {
  return(
    <ProtectedRoute requiredRole="ADMIN">
      
          <DailyTasksSection />
        
    </ProtectedRoute>
  );
}
