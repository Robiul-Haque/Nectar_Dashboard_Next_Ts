import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { getCookie } from "./cookies";

// Determine the socket URL - we'll use the same as the API base URL
const NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let socket: Socket | null = null;

export const initializeSocket = () => {
  if (socket) {
    return socket;
  }

  const token = getCookie("token");
  if (!token) {
    return null;
  }

  socket = io(NEXT_PUBLIC_API_URL, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected successfully!");
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected");
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

