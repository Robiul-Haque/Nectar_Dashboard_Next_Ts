import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { getCookie, setCookie } from "./cookies";
import type { AppStore } from "@/redux/store";

let storeInstance: AppStore | null = null;

export const injectSocketStore = (s: AppStore) => {
  storeInstance = s;
};

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

  // 2. Check Redux Store (if injected)
  try {
    const stateToken = storeInstance?.getState()?.auth?.accessToken;
    if (stateToken && stateToken.trim()) return stateToken.trim();
  } catch {}

  // 3. Check LocalStorage
  try {
    const rawToken = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (rawToken && rawToken.trim()) return rawToken.trim();

    const persistData = localStorage.getItem("persist:auth") || localStorage.getItem("persist:root");
    if (persistData) {
      const parsed = JSON.parse(persistData);
      const auth = typeof parsed.auth === "string" ? JSON.parse(parsed.auth) : parsed;
      const token = auth?.accessToken;
      if (token && typeof token === "string" && token.trim()) {
        return token.replace(/^"|"$/g, "").trim();
      }
    }
  } catch {}

  return null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const cookieToken = getCookie("refreshToken");
  if (cookieToken && cookieToken.trim()) return cookieToken.trim();

  try {
    const rawToken = localStorage.getItem("refreshToken");
    if (rawToken && rawToken.trim()) return rawToken.trim();

    const persistRoot = localStorage.getItem("persist:root");
    if (persistRoot) {
      const parsed = JSON.parse(persistRoot);
      const auth = typeof parsed.auth === "string" ? JSON.parse(parsed.auth) : parsed.auth;
      if (auth?.refreshToken && typeof auth.refreshToken === "string" && auth.refreshToken.trim()) {
        return auth.refreshToken.trim();
      }
    }
  } catch {}

  return null;
};

let socket: Socket | null = null;
let isRefreshingSocketToken = false;

export const updateSocketAuthToken = (newToken: string) => {
  if (!newToken || !newToken.trim()) return;
  const bearerToken = newToken.startsWith("Bearer ") ? newToken.trim() : `Bearer ${newToken.trim()}`;
  if (socket) {
    socket.auth = { token: bearerToken };
    if (socket.io?.opts) {
      socket.io.opts.extraHeaders = { authorization: bearerToken };
    }
    if (socket.connected) {
      socket.disconnect().connect();
    } else {
      socket.connect();
    }
  }
};

const refreshDashboardToken = async (): Promise<string | null> => {
  if (isRefreshingSocketToken) return null;
  isRefreshingSocketToken = true;
  try {
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8010/api/v1";
    const refreshToken = getRefreshToken();
    const res = await fetch(`${apiBase}/auth/admin/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      const newAccessToken = data?.data?.accessToken || data?.accessToken;
      const newRefreshToken = data?.data?.refreshToken || data?.refreshToken;
      if (newAccessToken) {
        setCookie("accessToken", newAccessToken);
        if (newRefreshToken) setCookie("refreshToken", newRefreshToken);
        
        try {
          const { setCredentials } = await import("@/redux/features/auth/authSlice");
          const targetStore = storeInstance || (await import("@/redux/store")).store;
          const currentUser = targetStore?.getState()?.auth?.user;
          if (currentUser) {
            targetStore.dispatch(setCredentials({ user: currentUser, accessToken: newAccessToken, refreshToken: newRefreshToken }));
          }
        } catch {}

        return newAccessToken;
      }
    }
  } catch (e) {
    console.error("[SOCKET DASHBOARD ⚠️] Failed to auto-refresh socket token:", e);
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

  const expectedToken = token.startsWith("Bearer ") ? token.trim() : `Bearer ${token.trim()}`;

  if (socket) {
    const currentToken = (socket.auth as any)?.token;
    if (currentToken !== expectedToken) {
      socket.auth = { token: expectedToken };
      if (socket.io?.opts) {
        socket.io.opts.extraHeaders = { authorization: expectedToken };
      }
      if (socket.connected) {
        socket.disconnect().connect();
      } else {
        socket.connect();
      }
    } else if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  const socketUrl = getSocketUrl();

  let lastErrorLogTime = 0;
  try {
    socket = io(socketUrl, {
      auth: {
        token: expectedToken,
      },
      extraHeaders: {
        authorization: expectedToken,
      },
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2500,
    });

    socket.on("connect", () => {
      console.log("[SOCKET DASHBOARD 🟢] ✅ Socket connected successfully! Socket ID:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[SOCKET DASHBOARD 🔴] ⚠️ Socket disconnected. Reason:", reason);
    });

    socket.on("connect_error", async (error: Error) => {
      const now = Date.now();
      if (now - lastErrorLogTime > 15000) {
        console.warn("[SOCKET DASHBOARD ⚠️] Socket connection warning:", error?.message || 'Connection failed');
        lastErrorLogTime = now;
      }

      // If user has no tokens at all (logged out), stop reconnecting
      const currentToken = getAuthToken();
      const currentRefreshToken = getRefreshToken();
      if (!currentToken && !currentRefreshToken) {
        try { socket?.disconnect(); } catch {}
        return;
      }

      const errMsg = (error?.message || '').toLowerCase();
      const isAuthError =
        errMsg.includes("invalid") ||
        errMsg.includes("expired") ||
        errMsg.includes("unauthorized") ||
        errMsg.includes("jwt expired");

      if (isAuthError) {
        try {
          const freshToken =
            (await refreshDashboardToken()) ||
            getAuthToken();

          if (freshToken && socket) {
            const freshBearer = freshToken.startsWith("Bearer ") ? freshToken.trim() : `Bearer ${freshToken.trim()}`;
            socket.auth = { token: freshBearer };
            if (socket.io?.opts) {
              socket.io.opts.extraHeaders = {
                authorization: freshBearer,
              };
            }
            socket.disconnect().connect();
          } else {
            socket?.disconnect();
          }
        } catch (e) {
          console.warn("[SOCKET DASHBOARD ⚠️] Auth error recovery failed:", e);
        }
      }
    });
  } catch (err) {
    console.warn("[SOCKET DASHBOARD ⚠️] initializeSocket failed gracefully:", err);
    return null;
  }

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
