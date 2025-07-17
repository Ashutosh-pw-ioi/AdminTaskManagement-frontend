"use client";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/src/app/contexts/AuthProvider"; // Adjust path as needed

interface LoginPageProps {
  role: "admin" | "operation";
  imagePath: string;
}

interface ApiError {
  message: string;
}

const roleConfig = {
  admin: {
    title: "Admin Portal",
    subtitle: "Welcome back to your admin panel",
    emailPlaceholder: "Enter your admin email",
    apiRole: "ADMIN",
  },
  operation: {
    title: "Operation Portal",
    subtitle: "Welcome back to your operations panel",
    emailPlaceholder: "Enter your operation email",
    apiRole: "OPERATION",
  },
};

export default function LoginPage({ role, imagePath }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();

  const config = roleConfig[role];

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(`/dashboard/${role}`);
    }
  }, [isAuthenticated, user, role, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address", {
        toastId: "email-required",
      });
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password", {
        toastId: "password-required",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address", {
        toastId: "email-invalid",
      });
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password, config.apiRole);
      
      toast.success(`Welcome back! Redirecting to your ${role} dashboard...`, {
        toastId: "login-success",
        autoClose: 2000,
      });

      // Small delay to show success message
      setTimeout(() => {
        router.push(`/dashboard/${role}`);
      }, 2000);
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "An unexpected error occurred. Please try again.";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          const statusCode = error.response.status;
          const apiError = error.response.data as ApiError;

          switch (statusCode) {
            case 400:
              errorMessage =
                apiError.message || "Invalid request. Please check your input.";
              break;
            case 401:
              errorMessage = "Invalid email or password. Please try again.";
              break;
            case 403:
              errorMessage = `Access denied. You don't have ${role} permissions.`;
              break;
            case 404:
              errorMessage = "User not found. Please check your credentials.";
              break;
            case 422:
              errorMessage =
                "Invalid input data. Please check your credentials.";
              break;
            case 429:
              errorMessage = "Too many login attempts. Please try again later.";
              break;
            case 500:
            case 502:
            case 503:
              errorMessage = "Server error. Please try again later.";
              break;
            default:
              errorMessage =
                apiError.message || "Login failed. Please try again.";
          }
        } else if (error.request) {
          errorMessage =
            "Unable to connect to server. Please check your internet connection.";
        } else if (error.code === "ECONNABORTED") {
          errorMessage = "Request timeout. Please try again.";
        }
      }

      toast.error(errorMessage, {
        toastId: "login-error",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F1CB8D]">
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
        toastClassName="!rounded-lg !text-sm"
      />

      <div className="flex max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="w-full md:w-[45%] p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{config.title}</h1>
            <p className="text-gray-600 mt-2">{config.subtitle}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder={config.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#486AA0] focus:border-[#486AA0] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#486AA0] focus:border-[#486AA0] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-1 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center bg-[#486AA0] hover:bg-[#1B3A6A] cursor-pointer ease-in-out"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login to Dashboard"
              )}
            </button>
          </form>
        </div>

        <div className="hidden md:block w-[55%]">
          <Image
            src={imagePath}
            width={500}
            height={500}
            className="w-full h-full object-cover"
            alt={`${config.title} illustration`}
            onError={(e) => {
              console.warn("Image failed to load:", imagePath);
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      </div>
    </div>
  );
}