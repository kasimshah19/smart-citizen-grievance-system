import { io } from "socket.io-client";
import { API_BASE_URL } from "./api";

let socket = null;

// Called after login (or on app load, if already logged in)
export const connectSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  // Reuse any existing instance — even one that's still in the middle of
  // connecting — rather than spawning a second connection.
  if (socket) return socket;

  socket = io(API_BASE_URL, {
    auth: { token },
  });

  return socket;
};

// Called on logout, so a stale connection doesn't linger
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
