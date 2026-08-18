import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { getCookie, setCookie } from "./cookies";
import { store } from "@/redux/store";

const getSocketUrl = (): string => {
  const envUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8010";

  return envUrl.replace(/\/api\/v1\/?$/, "");
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;

  // 1. Check Cookie
  const cookieToken = getCookie("accessToken") || getCookie("token");
  if (cookieToken && cookieToken.trim()) return cookieToken.trim();

  // 2. Check Redux Store
  try {
    const stateToken = store?.getState()?.auth?.accessToken;
    if (stateToken && stateToken.trim()) return stateToken.trim();
  } catch (e) {}

  // 3. Check LocalStorage
  try {
    const rawToken = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (rawToken && rawToken.trim()) return rawToken.trim();

    const persistRoot = localStorage.getItem("persist:root");
    if (persistRoot) {
      const parsed = JSON.parse(persistRoot);
      const auth = typeof parsed.auth === "string" ? JSON.parse(parsed.auth) : parsed.auth;
      if (auth?.accessToken && typeof auth.accessToken === "string" && auth.accessToken.trim()) {
        return auth.accessToken.trim();
      }
    }
  } catch (e) {}

  return null;
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
  const token = getAuthToken();
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
    transports: ["polling", "websocket"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
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
        getAuthToken();

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
