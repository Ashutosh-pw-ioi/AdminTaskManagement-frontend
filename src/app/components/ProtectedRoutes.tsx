"use client";
import { useAuth } from "@/src/app/contexts/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = "/auth/login/admin" 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast.error("Please Login First", {
          toastId: "login-required",
        });
        router.push(redirectTo);
        return;
      }
      
      if (requiredRole && user?.role !== requiredRole) {
        toast.error("Access Denied: Insufficient permissions", {
          toastId: "access-denied",
        });
        router.push("/dashboard/admin/unauthorized");
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRole, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <ToastContainer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <ToastContainer />
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}