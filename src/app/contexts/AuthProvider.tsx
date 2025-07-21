"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from "react";
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
  const pathname = usePathname();
  
  // Prevent multiple simultaneous auth checks
  const authCheckInProgress = useRef(false);
  const mounted = useRef(true);

  axios.defaults.withCredentials = true;

  const isLoginPage = useCallback((path: string) => {
    const loginPaths = [
      '/',
      '/auth/login/admin',
      '/auth/login/operation'
    ];
    
    return loginPaths.includes(path) || path.includes('/auth/login') || path.includes('/login');
  }, []);

  const checkAuth = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (authCheckInProgress.current) {
      return;
    }

    try {
      authCheckInProgress.current = true;
      setIsLoading(true);
      
      const response = await axios.get("http://localhost:8000/api/auth/check", {
        withCredentials: true,
        timeout: 10000,
      });

      const userData = response.data;
      
      // Only update state if component is still mounted
      if (mounted.current) {
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        });
        setIsAuthenticated(true);
      }
      
    } catch (error) {
      if (mounted.current) {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
      authCheckInProgress.current = false;
    }
  }, []);

  const login = useCallback(async (email: string, password: string, role: string) => {
    try {
      console.log("Attempting login with email:", email, "and role:", role);
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
      
      if (mounted.current) {
        const newUser = {
          id: userData.userId,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        };
        
        setUser(newUser);
        setIsAuthenticated(true);
        setIsLoading(false); // Explicitly set loading to false after successful login
      }
      
    } catch (error) {
      if (mounted.current) {
        setIsLoading(false);
      }
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
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
      // Handle logout error silently
    } finally {
      if (mounted.current) {
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Initial auth check effect
  useEffect(() => {
    const currentIsLoginPage = isLoginPage(pathname);
    
    if (currentIsLoginPage) {
      // On login pages, just set loading to false and skip auth check
      setIsLoading(false);
      return;
    }

    // Only check auth if not on login page
    if (!currentIsLoginPage && !authCheckInProgress.current) {
      checkAuth();
    }
  }, [pathname, checkAuth, isLoginPage]);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};