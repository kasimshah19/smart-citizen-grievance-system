import axios from "axios";

// In production (deployed to Vercel), the backend lives on its own separate
// URL, set via the VITE_API_URL environment variable at build time.
// In local development, we keep auto-detecting the current hostname (this is
// what makes testing from your phone over WiFi work without any changes).
export const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;