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
    
  
    return path;
  }, [redirectTo, pathname]);

  const getExpectedRole = useMemo(() => {
    const role = (() => {
     
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
    
    
    return role;
  }, [requiredRole, pathname]);

  useEffect(() => {
   

    if (isLoading) {
      
      hasRedirected.current = false;
      return;
    }

    if (pathname.includes('/auth/login')) {
      
      hasRedirected.current = false;
      return;
    }

    // Prevent multiple redirects
    if (hasRedirected.current) {
     
      return;
    }

    if (!isAuthenticated) {
      
      hasRedirected.current = true;
      toast.error("Please Login First", {
        toastId: "login-required",
      });
      router.push(getRedirectPath);
      return;
    }

    if (getExpectedRole && user?.role !== getExpectedRole) {
   
      
      hasRedirected.current = true;
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