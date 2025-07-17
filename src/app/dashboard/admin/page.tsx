"use client";
import { useAuth } from "../../contexts/AuthProvider";
import ProtectedRoute from "../../components/ProtectedRoutes";
import AdminOverviewSection from "./AdminOverviewSection";

export default function Page() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminOverviewSection />
    </ProtectedRoute>
  );
}
