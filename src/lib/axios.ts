// Axios instance pre-configured for the RentNest backend.
//
// HOW IT WORKS:
// 1. Every request automatically gets the Bearer token from localStorage.
// 2. If the server replies 401 (token expired), we try a silent token refresh.
//    If the refresh also fails we clear auth state and redirect to /auth/login.
// 3. All other errors are bubbled up so callers can handle them with try/catch.

import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ---- Request interceptor: attach access token ----------------------------
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ---- Response interceptor: handle 401 with a silent refresh ---------------
let isRefreshing = false;
// Queue of failed requests waiting for the new token
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response, // pass through successful responses unchanged
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh once per request (avoid infinite loops)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Another refresh is already in flight — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh-token`, {
          refreshToken,
        });

        const newAccessToken = data.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        // Also update the cookie that middleware reads
        document.cookie = `accessToken=${newAccessToken}; path=/; max-age=${60 * 60 * 24 * 7}`;

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear everything and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        document.cookie = "accessToken=; max-age=0; path=/";
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
