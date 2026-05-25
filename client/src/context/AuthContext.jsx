import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { setAccessToken, getAccessToken } from "../lib/axios";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Access token lives in memory (not localStorage) — XSS safe
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("trip_user")) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // ─── Persist user (non-sensitive) ──────────────────────────────────────────
  const saveUser = (userData) => {
    if (userData) {
      localStorage.setItem("trip_user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("trip_user");
    }
    setUser(userData);
  };

  // ─── Restore session on page refresh ───────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await api.post("/auth/refresh");
        setAccessToken(data.accessToken);
        saveUser(data.user);
      } catch {
        // No valid refresh token — clear stale user
        saveUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };
    restoreSession();
  }, []);

  // ─── Listen for forced logout (from axios interceptor) ─────────────────────
  useEffect(() => {
    const handleForcedLogout = () => {
      saveUser(null);
      setAccessToken(null);
      toast.error("Session expired. Please log in again.");
    };
    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, []);

  // ─── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    return data;
  }, []);

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setAccessToken(data.accessToken);
    saveUser(data.user);
    return data;
  }, []);

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // best effort
    }
    setAccessToken(null);
    saveUser(null);
  }, []);

  // ─── Update local user state ───────────────────────────────────────────────
  const updateUser = useCallback((updatedUser) => {
    saveUser(updatedUser);
  }, []);

  const isAuthenticated = !!getAccessToken() && !!user;

  return (
    <AuthContext.Provider
      value={{ user, loading, initialized, isAuthenticated, register, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
