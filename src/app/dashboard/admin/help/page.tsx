import type { Metadata } from "next";
import HelpSection from "./HelpSection";
import ProtectedRoute from "@/src/app/components/ProtectedRoutes";

export const metadata: Metadata = {
  title: "Help & Support",
};

export default function Page() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <HelpSection />
    </ProtectedRoute>
  );
}
