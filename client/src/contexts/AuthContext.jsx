import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [citizen, setCitizen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Always fetch the full, up-to-date profile from the backend
        const res = await api.get("/api/auth/me");
        setCitizen(res.data.citizen);
        localStorage.setItem("citizen", JSON.stringify(res.data.citizen));
        connectSocket();
      } catch (error) {
        // Token invalid or expired — clear stale session
        localStorage.removeItem("token");
        localStorage.removeItem("citizen");
        setCitizen(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (citizenData, token) => {
    localStorage.setItem("token", token);
    try {
      // Fetch the complete profile right after login, not just the partial login response
      const res = await api.get("/api/auth/me");
      localStorage.setItem("citizen", JSON.stringify(res.data.citizen));
      setCitizen(res.data.citizen);
    } catch (error) {
      localStorage.setItem("citizen", JSON.stringify(citizenData));
      setCitizen(citizenData);
    }
    connectSocket();
  };

  const logout = () => {
    localStorage.removeItem("citizen");
    localStorage.removeItem("token");
    setCitizen(null);
    disconnectSocket();
  };

  const updateCitizen = (updatedData) => {
    localStorage.setItem("citizen", JSON.stringify(updatedData));
    setCitizen(updatedData);
  };

  return (
    <AuthContext.Provider value={{ citizen, login, logout, loading, updateCitizen }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}