"use client";

import ProtectedRoute from "../../components/ProtectedRoutes";
import OperationOverviewSection from "./OperationOverviewSection";

export default function Page() {
  return (
    <ProtectedRoute requiredRole="OPERATION">
      <OperationOverviewSection />
    </ProtectedRoute>
  );
}
