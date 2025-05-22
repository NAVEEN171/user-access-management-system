import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface User {
  id: string;
  username: string;
  password: string;
  role: string;
}
interface Request {
  id: string;
  userId: string;
  softwareId: string;
  accessType: "Read" | "Write" | "Admin";
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  software: Software;
}
interface Software {
  id: number | string;
  name: string;
  description: string;
  accessLevels: string[];
}
interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  user: User | null;
  userId: string | null;
  setUserId: (userId: string | null) => void;
  setUser: (user: User | null) => void;

  logout: () => void;
  requests: Request[];
  fetchUserRequests: () => Promise<void>;
  setRequests: (requests: Request[]) => void;

  setCustomCookie: (
    name: string,
    value: string,
    expirationTime?: number | null,
    isSessionCookie?: boolean
  ) => void;

  getCustomCookie: (name: string) => string | null;
  deleteCustomCookie: (name: string) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContextProvider = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);

  const fetchUserRequests = async () => {
    const BackendURL = import.meta.env.VITE_BACKEND_URL;

    const response = await fetch(
      `${BackendURL}/api/software/get-requests/${userId}`
    );
    if (response.ok) {
      const data = await response.json();
      setRequests(data.requests);
    }
  };
  const fetchUser = async () => {
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const response = await fetch(`${backendURL}/api/auth/get-user/${userId}`);
    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchUser();
  }, [userId]);

  const logout = (): void => {
    deleteCustomCookie("accessToken");
    deleteCustomCookie("refreshToken");
    deleteCustomCookie("userId");

    setIsLoggedIn(false);
    setUserId(null);
    setUser(null);
  };

  const setCustomCookie = (
    name: string,
    value: string,
    expirationTime: number | null = null,
    isSessionCookie: boolean = false
  ): void => {
    const environment = import.meta.env.VITE_NODE_ENV;

    let cookieString = `${name}=${value}; path=/; samesite=strict`;

    if (environment === "production") {
      cookieString += "; secure";
    }

    if (expirationTime && !isSessionCookie) {
      const expiryDate = new Date();
      expiryDate.setTime(expiryDate.getTime() + 24 * 60 * 60 * 1000);
      cookieString += `; expires=${expiryDate.toUTCString()}`;
    }

    document.cookie = cookieString;
  };

  const getCustomCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  const deleteCustomCookie = (name: string): void => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 2024 00:00:01 GMT;`;
  };

  const contextValue: AuthContextType = {
    isLoggedIn,
    user,
    userId,
    setUserId,
    requests,
    setRequests,
    fetchUserRequests,
    setUser,

    logout,
    setIsLoggedIn,
    setCustomCookie,
    getCustomCookie,
    deleteCustomCookie,
  };

  return (
    <AuthContextProvider.Provider value={contextValue}>
      {children}
    </AuthContextProvider.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContextProvider);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthContext = AuthContextProvider;
