import { createContext, useContext, useEffect, useState } from "react";
import { getToken } from "../utils/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize from localStorage immediately (synchronous)
    return !!getToken();
  });
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    // Sync with localStorage on mount (already initialized synchronously, so no loading needed)
    const token = getToken();
    setIsAuthenticated(!!token);
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
