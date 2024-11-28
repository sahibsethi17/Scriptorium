// components/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Check login status on component mount and listen for login status changes
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    setIsLoggedIn(!!accessToken);

    // Listen for custom login status change event
    const handleLoginStatusChange = () => {
      const updatedToken = localStorage.getItem("accessToken");
      setIsLoggedIn(!!updatedToken);
    };

    window.addEventListener("loginStatusChange", handleLoginStatusChange);

    // Cleanup the event listener
    return () => {
      window.removeEventListener("loginStatusChange", handleLoginStatusChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};