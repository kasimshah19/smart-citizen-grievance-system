import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [citizen, setCitizen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Always fetch the full, up-to-date profile from the backend
        const res = await api.get("/api/auth/me");
        setCitizen(res.data.citizen);
        sessionStorage.setItem("citizen", JSON.stringify(res.data.citizen));
        connectSocket();
      } catch (error) {
        // Token invalid or expired — clear stale session
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("citizen");
        setCitizen(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (citizenData, token) => {
    sessionStorage.setItem("token", token);
    try {
      // Fetch the complete profile right after login, not just the partial login response
      const res = await api.get("/api/auth/me");
      sessionStorage.setItem("citizen", JSON.stringify(res.data.citizen));
      setCitizen(res.data.citizen);
    } catch (error) {
      sessionStorage.setItem("citizen", JSON.stringify(citizenData));
      setCitizen(citizenData);
    }
    connectSocket();
  };

  const logout = () => {
    sessionStorage.removeItem("citizen");
    sessionStorage.removeItem("token");
    setCitizen(null);
    disconnectSocket();
  };

  const updateCitizen = (updatedData) => {
    sessionStorage.setItem("citizen", JSON.stringify(updatedData));
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