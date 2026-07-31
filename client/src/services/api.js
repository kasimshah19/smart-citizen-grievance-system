import axios from "axios";

// Uses whatever hostname the browser is currently on (localhost on this PC,
// or this PC's LAN IP when opened from a phone/other device on the network)
// so API calls always point to the right place.
export const API_BASE_URL = `http://${window.location.hostname}:5000`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;