"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const pathname = usePathname();

  const publicRoutes = [
    '/auth/login/admin',
    '/auth/login/operator',
    '/auth/login/operation', // Added this in case you have this route too
    '/', 
  ];

  // Configure axios to include cookies in requests
  axios.defaults.withCredentials = true;

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "http://localhost:8000/api/auth/check",
        {
          withCredentials: true,
          timeout: 10000,
        }
      );
      
      const userData = response.data;
      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      setHasCheckedAuth(true);
    }
  };

  const login = async (email: string, password: string, role: string) => {
    try {
      console.log(email, password, role);
      const response = await axios.post(
        "http://localhost:8000/api/auth/login",
        {
          email: email.trim(),
          password: password.trim(),
          role: role,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
          timeout: 10000,
        }
      );

      const userData = response.data.user;
      setUser({
        id: userData.userId,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw to handle in component
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/auth/logout",
        {},
        {
          withCredentials: true,
          timeout: 10000,
        }
      );
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // Clear user state regardless of API call success
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    // Only check auth once on initial load and not on login pages
    if (!hasCheckedAuth) {
      const isLoginPage = pathname.includes('/auth/login');
      
      if (!isLoginPage) {
        checkAuth();
        setIsAuthenticated(true)
      } else {
        setIsLoading(false);
        setHasCheckedAuth(true);
      }
    }
  }, [hasCheckedAuth, pathname]);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};