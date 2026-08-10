import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { getCookie, setCookie } from "./cookies";

const getSocketUrl = (): string => {
  const envUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8010";

  return envUrl.replace(/\/api\/v1\/?$/, "");
};

let socket: Socket | null = null;
let isRefreshingSocketToken = false;

const refreshDashboardToken = async (): Promise<string | null> => {
  if (isRefreshingSocketToken) return null;
  isRefreshingSocketToken = true;
  try {
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8010/api/v1";
    const res = await fetch(`${apiBase}/auth/admin/refresh-token`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      const newAccessToken = data?.data?.accessToken || data?.accessToken;
      if (newAccessToken) {
        setCookie("accessToken", newAccessToken);
        return newAccessToken;
      }
    }
  } catch (e) {
    console.error("Failed to auto-refresh socket token:", e);
  } finally {
    isRefreshingSocketToken = false;
  }
  return null;
};

export const initializeSocket = () => {
  const token = getCookie("accessToken") || getCookie("token");
  if (!token) {
    return null;
  }

  if (socket) {
    if (!socket.connected) {
      socket.auth = { token: `Bearer ${token}` };
      if (socket.io?.opts) {
        socket.io.opts.extraHeaders = { authorization: `Bearer ${token}` };
      }
      socket.connect();
    }
    return socket;
  }

  const socketUrl = getSocketUrl();

  socket = io(socketUrl, {
    auth: {
      token: `Bearer ${token}`,
    },
    extraHeaders: {
      authorization: `Bearer ${token}`,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected successfully!");
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected");
  });

  socket.on("connect_error", async (error: Error) => {
    console.error("❌ Socket connection error:", error.message);
    const isAuthError =
      error.message === "Invalid or expired token" ||
      error.message === "Authentication token required" ||
      error.message.toLowerCase().includes("token expired") ||
      error.message.toLowerCase().includes("jwt expired");

    if (isAuthError) {
      const freshToken =
        (await refreshDashboardToken()) ||
        getCookie("accessToken") ||
        getCookie("token");

      if (freshToken && socket) {
        socket.auth = { token: `Bearer ${freshToken}` };
        if (socket.io?.opts) {
          socket.io.opts.extraHeaders = {
            authorization: `Bearer ${freshToken}`,
          };
        }
        socket.disconnect().connect();
      }
    }
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

