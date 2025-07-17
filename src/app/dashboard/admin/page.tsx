'use client'
import type { Metadata } from "next";
import { useAuth } from "../../contexts/AuthProvider";
import ProtectedRoute from "../../components/ProtectedRoutes";
import { useRouter } from "next/navigation";





export default function Page() {
  const { user , isAuthenticated} = useAuth();
  const router = useRouter();
  console.log(user?.role);

  // if (!user && !isAuthenticated) {
  //   router.push("/auth/login/admin");
  //   return null; // Prevent rendering while redirecting
    

  // }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-2">
            <div>
              <strong>ID:</strong> {user?.id}
            </div>
            <div>
              <strong>Name:</strong> {user?.name}
            </div>
            <div>
              <strong>Email:</strong> {user?.email}
            </div>
            <div>
              <strong>Role:</strong> {user?.role}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
