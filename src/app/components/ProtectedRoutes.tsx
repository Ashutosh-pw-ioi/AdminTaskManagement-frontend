"use client";
import { useAuth } from "@/src/app/contexts/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
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
  const hasRedirected = useRef(false);

  const getRedirectPath = useMemo(() => {
    const path = (() => {
      if (redirectTo) {
        console.log("Using custom redirect path:", redirectTo);
        return redirectTo;
      }

      if (pathname.includes("/admin") || pathname.includes("/dashboard/admin")) {
        return "/auth/login/admin";
      } else if (
        pathname.includes("/operation") ||
        pathname.includes("/dashboard/operation")
      ) {
        return "/auth/login/operation";
      }

      return "/auth/login/admin";
    })();
    
    console.log("Computed redirect path:", path, "for pathname:", pathname);
    return path;
  }, [redirectTo, pathname]);

  const getExpectedRole = useMemo(() => {
    const role = (() => {
      console.log("Required Role from props:", requiredRole);
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
    })();
    
    console.log("Expected role computed:", role, "for pathname:", pathname);
    return role;
  }, [requiredRole, pathname]);

  useEffect(() => {
    console.log("=== ProtectedRoute Effect Debug ===");
    console.log("Pathname:", pathname);
    console.log("isLoading:", isLoading);
    console.log("isAuthenticated:", isAuthenticated);
    console.log("User:", user);
    console.log("User role:", user?.role, "Type:", typeof user?.role);
    console.log("Expected role:", getExpectedRole, "Type:", typeof getExpectedRole);
    console.log("Role comparison result:", user?.role === getExpectedRole);
    console.log("Role string comparison:", `"${user?.role}" === "${getExpectedRole}"`);
    console.log("Redirect path:", getRedirectPath);
    console.log("Has redirected:", hasRedirected.current);
    console.log("===============================");

    if (isLoading) {
      console.log("Still loading, skipping checks");
      hasRedirected.current = false;
      return;
    }

    if (pathname.includes('/auth/login')) {
      console.log("On login page, skipping checks");
      hasRedirected.current = false;
      return;
    }

    // Prevent multiple redirects
    if (hasRedirected.current) {
      console.log("Already redirected, preventing duplicate redirect");
      return;
    }

    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to:", getRedirectPath);
      hasRedirected.current = true;
      toast.error("Please Login First", {
        toastId: "login-required",
      });
      router.push(getRedirectPath);
      return;
    }

    if (getExpectedRole && user?.role !== getExpectedRole) {
      console.log("Role mismatch detected!");
      console.log("User role:", user?.role);
      console.log("Expected role:", getExpectedRole);
      console.log("Strict equality check:", user?.role === getExpectedRole);
      console.log("Case insensitive check:", user?.role?.toUpperCase() === getExpectedRole?.toUpperCase());
      
      hasRedirected.current = true;
      toast.error("Access Denied: Insufficient permissions", {
        toastId: "access-denied",
      });

      if (pathname.includes('/admin')) {
        console.log("Redirecting to admin login");
        router.push("/auth/login/admin");
      } else if (pathname.includes('/operation')) {
        console.log("Redirecting to operation login");
        router.push("/auth/login/operation");
      } else {
        console.log("Redirecting to home");
        router.push("/");
      }
      return;
    }

    console.log("All checks passed, access granted");
    hasRedirected.current = false;
  }, [
    isAuthenticated,
    user?.role,
    isLoading,
    pathname,
    router,
    getRedirectPath,
    getExpectedRole,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss={true}
          draggable={true}
          pauseOnHover={true}
          theme="light"
          className="!z-50"
        />
      </div>
    );
  }

  if (pathname.includes('/auth/login')) {
    return (
      <>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss={true}
          draggable={true}
          pauseOnHover={true}
          theme="light"
          className="!z-50"
        />
      </>
    );
  }

  if (!isAuthenticated) {
    console.log("Rendering: Not authenticated state");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss={true}
          draggable={true}
          pauseOnHover={true}
          theme="light"
          className="!z-50"
        />
      </div>
    );
  }

  if (getExpectedRole && user?.role !== getExpectedRole) {
    console.log("Rendering: Role mismatch state");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Access denied. Redirecting...</p>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss={true}
          draggable={true}
          pauseOnHover={true}
          theme="light"
          className="!z-50"
        />
      </div>
    );
  }

  console.log("Rendering: Protected content");
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={true}
        draggable={true}
        pauseOnHover={true}
        theme="light"
        className="!z-50"
      />
    </>
  );
}