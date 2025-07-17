"use client";
import { useAuth } from "@/src/app/contexts/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string; // Optional override for custom redirect
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo // If provided, will override automatic detection
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Function to determine redirect path based on current route
  const getRedirectPath = () => {
    if (redirectTo) {
      return redirectTo; // Use custom redirect if provided
    }

    // Auto-detect based on current path
    if (pathname.includes('/admin') || pathname.includes('/dashboard/admin')) {
      return "/auth/login/admin";
    } else if (pathname.includes('/operation') || pathname.includes('/dashboard/operation')) {
      return "/auth/login/operation";
    } else if (pathname.includes('/user') || pathname.includes('/dashboard/user')) {
      return "/auth/login/user";
    }
    
    // Default fallback
    return "/auth/login/admin";
  };

  // Function to get appropriate role based on path
  const getExpectedRole = () => {
    if (requiredRole) {
      return requiredRole; // Use explicitly provided role
    }

    // Auto-detect role based on current path
    if (pathname.includes('/admin') || pathname.includes('/dashboard/admin')) {
      return "ADMIN";
    } else if (pathname.includes('/operation') || pathname.includes('/dashboard/operation')) {
      return "OPERATION";
    } else if (pathname.includes('/user') || pathname.includes('/dashboard/user')) {
      return "USER";
    }
    
    return null; // No role requirement
  };

  useEffect(() => {
    if (!isLoading) {
      const redirectPath = getRedirectPath();
      const expectedRole = getExpectedRole();

      if (!isAuthenticated) {
        toast.error("Please Login First", {
          toastId: "login-required",
        });
        router.push(redirectPath);
        return;
      }

      if (expectedRole && user?.role !== expectedRole) {
        toast.error("Access Denied: Insufficient permissions", {
          toastId: "access-denied",
        });
        
        // Redirect to appropriate unauthorized page or login
        if (pathname.includes('/admin')) {
          router.push("/dashboard/admin/unauthorized");
        } else if (pathname.includes('/operation')) {
          router.push("/dashboard/operation/unauthorized");
        } else {
          router.push("/unauthorized");
        }
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, pathname, router, requiredRole, redirectTo]);

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

  const expectedRole = getExpectedRole();
  if (expectedRole && user?.role !== expectedRole) {
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