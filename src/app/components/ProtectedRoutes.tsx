"use client";
import { useAuth } from "@/src/app/contexts/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useCallback, useMemo } from "react";
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
  redirectTo,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Memoize these functions to prevent infinite re-renders
  const getRedirectPath = useMemo(() => {
    if (redirectTo) {
      return redirectTo;
    }

    if (pathname.includes("/admin") || pathname.includes("/dashboard/admin")) {
      return "/auth/login/admin";
    } else if (
      pathname.includes("/operation") ||
      pathname.includes("/dashboard/operation")
    ) {
      return "/auth/login/operation";
    } else if (
      pathname.includes("/user") ||
      pathname.includes("/dashboard/user")
    ) {
      return "/auth/login/user";
    }

    return "/auth/login/admin";
  }, [redirectTo, pathname]);

  const getExpectedRole = useMemo(() => {
    if (requiredRole) {
      return requiredRole;
    }

    if (pathname.includes("/admin") || pathname.includes("/dashboard/admin")) {
      return "ADMIN";
    } else if (
      pathname.includes("/operation") ||
      pathname.includes("/dashboard/operation")
    ) {
      return "OPERATION";
    }
    
    return null;
  }, [requiredRole, pathname]);

  useEffect(() => {
    // Don't redirect if still loading
    if (isLoading) {
      return;
    }

    // Don't redirect if already on a login page
    if (pathname.includes('/auth/login')) {
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please Login First", {
        toastId: "login-required",
      });
      router.push(getRedirectPath);
      return;
    }

    if (getExpectedRole && user?.role !== getExpectedRole) {
      toast.error("Access Denied: Insufficient permissions", {
        toastId: "access-denied",
      });

      if (pathname.includes('/admin')) {
        router.push("/auth/login/admin");
      } else if (pathname.includes('/operation')) {
        router.push("/auth/login/operation");
      } else {
        router.push("/");
      }
      return;
    }
  }, [
    isAuthenticated,
    user?.role, // Only watch the role, not the entire user object
    isLoading,
    pathname,
    router,
    getRedirectPath,
    getExpectedRole,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <ToastContainer />
      </div>
    );
  }

  // Don't render anything if on login page (let the login page handle itself)
  if (pathname.includes('/auth/login')) {
    return (
      <>
        {children}
        <ToastContainer />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <ToastContainer />
      </div>
    );
  }

  if (getExpectedRole && user?.role !== getExpectedRole) {
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