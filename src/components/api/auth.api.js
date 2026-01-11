// src/api/authApi.js
import axios from "axios";
import authService from "./authservice";

const AUTH_API_BASE_URL = `${import.meta.env.VITE_API_URL}/auth`;

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

const authApi = axios.create({
  baseURL: AUTH_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ==================== REQUEST INTERCEPTOR ====================

authApi.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================

authApi.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return authApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();
        processQueue(null, newAccessToken);
        
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return authApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await logout();
        
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.message || 
                        'Request failed';
    
    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
      originalError: error,
    });
  }
);

// ==================== AUTHENTICATION METHODS ====================

/**
 * Login with email and password
 */
export async function login(email, password) {
  try {
    if (!email?.trim() || !password?.trim()) {
      throw new Error("Email and password are required");
    }

    const response = await authApi.post("/login/", {
      email: email.trim(),
      password: password.trim(),
    });

    const { access, refresh, user } = response;

    if (access && refresh) {
      authService.setTokens(access, refresh, user);
    }

    return response;
  } catch (error) {
    throw {
      message: error.message || "Login failed",
      status: error.status,
      data: error.data,
    };
  }
}

/**
 * Logout current user
 */
export async function logout() {
  try {
    const refreshToken = authService.getRefreshToken();
    
    if (refreshToken) {
      await authApi.post("/logout/", { refresh: refreshToken });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    authService.clearTokens();
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken() {
  const refreshToken = authService.getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await axios.post(
      `${AUTH_API_BASE_URL}/refresh/`,
      { refresh: refreshToken },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const newAccessToken = response.data?.access;
    const newRefreshToken = response.data?.refresh;

    if (!newAccessToken) {
      throw new Error("No access token in refresh response");
    }

    authService.setAccessToken(newAccessToken);
    
    // Update refresh token if provided (rotating refresh tokens)
    if (newRefreshToken) {
      authService.setRefreshToken(newRefreshToken);
    }

    return newAccessToken;
  } catch (error) {
    authService.clearTokens();
    throw error;
  }
}

/**
 * Verify token validity
 */
export async function verifyToken(token) {
  const response = await authApi.post("/verify/", { token });
  return response;
}

/**
 * Check current authentication status
 */
export async function checkAuth() {
  try {
    const token = authService.getAccessToken();

    if (!token) {
      return false;
    }

    const response = await authApi.get("/me/");
    return response;
  } catch (error) {
    authService.clearTokens();
    return false;
  }
}

/**
 * Register new user
 */
export async function register(email, password, name) {
  try {
    const response = await authApi.post("/register/", {
      email: email.trim(),
      password: password.trim(),
      name: name?.trim(),
    });

    const { access, refresh, user } = response;

    if (access && refresh) {
      authService.setTokens(access, refresh, user);
    }

    return response;
  } catch (error) {
    throw {
      message: error.message || "Registration failed",
      status: error.status,
      data: error.data,
    };
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email) {
  const response = await authApi.post("/password-reset/request/", {
    email: email.trim(),
  });
  return response;
}

/**
 * Confirm password reset with token
 */
export async function confirmPasswordReset(token, newPassword) {
  const response = await authApi.post("/password-reset/confirm/", {
    token,
    password: newPassword,
  });
  return response;
}

export default authApi;
