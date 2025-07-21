"use client";
import { JSX, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/src/app/contexts/AuthProvider";

interface LoginPageProps {
  role: "admin" | "operation";
  imagePath: string;
}

interface ApiError {
  message: string;
}

interface RoleConfigItem {
  title: string;
  subtitle: string;
  emailPlaceholder: string;
  apiRole: "ADMIN" | "OPERATION";
  redirectPath: string;
}

type RoleConfigMap = {
  [K in "admin" | "operation"]: RoleConfigItem;
};

const roleConfig: RoleConfigMap = {
  admin: {
    title: "Admin Portal",
    subtitle: "Welcome back to your admin panel",
    emailPlaceholder: "Enter your admin email",
    apiRole: "ADMIN",
    redirectPath: "/dashboard/admin",
  },
  operation: {
    title: "Operation Portal",
    subtitle: "Welcome back to your operations panel",
    emailPlaceholder: "Enter your operation email",
    apiRole: "OPERATION",
    redirectPath: "/dashboard/operation",
  },
};

export default function LoginPage({ role, imagePath }: LoginPageProps): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();
  const config: RoleConfigItem = roleConfig[role.toLowerCase() as keyof RoleConfigMap];

  const validateInput = (): boolean => {
    if (!email.trim()) {
      toast.error("Please enter your email address", {
        toastId: "email-required",
      });
      return false;
    }

    if (!password.trim()) {
      toast.error("Please enter your password", {
        toastId: "password-required",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address", {
        toastId: "email-invalid",
      });
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long", {
        toastId: "password-length",
      });
      return false;
    }

    return true;
  };

  const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const statusCode = error.response.status;
        const apiError = error.response.data as ApiError;

        const errorMessages: Record<number, string> = {
          400: apiError.message || "Invalid request. Please check your input.",
          401: "Invalid email or password. Please try again.",
          403: `Access denied. You don't have ${role} permissions.`,
          404: "User not found. Please check your credentials.",
          422: "Invalid input data. Please check your credentials.",
          429: "Too many login attempts. Please try again later.",
          500: "Server error. Please try again later.",
          502: "Server error. Please try again later.",
          503: "Server error. Please try again later.",
        };

        return errorMessages[statusCode] || apiError.message || "Login failed. Please try again.";
      } else if (error.request) {
        return "Unable to connect to server. Please check your internet connection.";
      } else if (error.code === "ECONNABORTED") {
        return "Request timeout. Please try again.";
      }
    }

    return "An unexpected error occurred. Please try again.";
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (isLoading || !validateInput()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(email.trim(), password, config.apiRole);
      
      toast.success("Welcome back!", {
        toastId: "login-success",
        autoClose: 1000,
      });

      router.replace(config.redirectPath);
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, {
        toastId: "login-error",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (): void => {
    setImageError(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !isLoading) {
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1CB8D]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#486AA0] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Checking authentication...</p>
        </div>
      </div>
    );
  }

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
              <label 
                htmlFor="email" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder={config.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#486AA0] focus:border-transparent transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                aria-describedby="email-error"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#486AA0] focus:border-transparent transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  minLength={6}
                  aria-describedby="password-error"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:text-gray-600"
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
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
                      aria-hidden="true"
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
              className="w-full text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#486AA0] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center bg-[#486AA0] hover:bg-[#1B3A6A] cursor-pointer ease-in-out"
              aria-describedby="login-button-description"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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

        <div className="hidden md:block w-[55%] relative bg-gray-100">
          {!imageError ? (
            <Image
              src={imagePath}
              width={500}
              height={500}
              className="w-full h-full object-cover"
              alt={`${config.title} illustration`}
              priority
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg 
                  className="w-16 h-16 mx-auto mb-4 text-gray-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
                <p className="text-sm">Image not available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}