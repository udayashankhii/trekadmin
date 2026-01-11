// src/services/auth/authService.js

/**
 * Shared Authentication Service
 * Handles token management and storage for both user and admin authentication
 */

// Token storage keys
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

export const authService = {
  // ==================== TOKEN GETTERS ====================
  
  getAccessToken: () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // ==================== TOKEN SETTERS ====================
  
  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  },

  setRefreshToken: (token) => {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  setTokens: (accessToken, refreshToken, user = null) => {
    authService.setAccessToken(accessToken);
    authService.setRefreshToken(refreshToken);
    if (user) authService.setUser(user);
  },

  // ==================== TOKEN MANAGEMENT ====================
  
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated: () => {
    return !!authService.getAccessToken();
  },

  // ==================== TOKEN VALIDATION ====================
  
  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      // Decode JWT payload (base64)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiry;
    } catch (error) {
      console.error('Token decode error:', error);
      return true;
    }
  },

  shouldRefreshToken: (token) => {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      const timeUntilExpiry = expiry - Date.now();
      
      // Refresh if less than 5 minutes remaining
      return timeUntilExpiry < 5 * 60 * 1000;
    } catch (error) {
      return false;
    }
  }
};

export default authService;
