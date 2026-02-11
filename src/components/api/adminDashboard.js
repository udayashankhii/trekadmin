import axios from "axios";
import authService from "./authservice";
import { refreshAccessToken, logout } from "./auth.api.js";

const API_BASE_URL =
  import.meta.env.VITE_ADMIN_API_BASE_URL || "http://127.0.0.1:8000/api/admin";

// Race condition prevention for token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ==================== AXIOS INSTANCE ====================
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // needed if your backend uses session cookies
});

// ==================== REQUEST INTERCEPTOR ====================
adminApi.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== RESPONSE INTERCEPTOR ====================
adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return adminApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();
        processQueue(null, newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return adminApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await logout();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Request failed";

    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
      originalError: error,
    });
  }
);

// ==================== API FUNCTIONS ====================
export const fetchDashboardStats = async () => {
  const response = await adminApi.get("/dashboard/stats/");
  return response.data;
};

export const fetchBookingStats = async () => {
  const response = await adminApi.get("/bookings/stats/");
  return response.data;
};

export const fetchTreksList = async () => {
  const response = await adminApi.get("/treks-list/");
  return response.data;
};

export default adminApi;
