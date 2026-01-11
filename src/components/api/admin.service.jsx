// src/services/auth/AdminAuthService.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { adminLogin, adminLogout, checkAdminAuth } from "../api/admin.api";
import { authService } from "./authservice";

// ==============================================
// ADMIN AUTH CONTEXT
// ==============================================

const AdminAuthContext = createContext(null);

// ==============================================
// ADMIN AUTH PROVIDER
// ==============================================

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ==============================================
  // INITIALIZE AUTH STATE
  // ==============================================

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = authService.getAccessToken();
      const storedUser = authService.getUser();

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      // Check if token is expired
      if (authService.isTokenExpired(token)) {
        try {
          await authService.refreshAccessToken();
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          await logout();
          setLoading(false);
          return;
        }
      }

      // Verify authentication with backend
      const response = await checkAdminAuth();

      if (response) {
        setUser(response.user || storedUser);
        setIsAuthenticated(true);
      } else {
        await logout();
      }
    } catch (err) {
      console.error("Auth initialization error:", err);
      setError(err.message);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  // ==============================================
  // LOGIN
  // ==============================================

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminLogin(email, password);

      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        
        return { success: true, data: response, user: response.user };
      }

      return { success: false, error: "No user data received" };
    } catch (err) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);

      return {
        success: false,
        error: errorMessage,
        status: err.status,
        data: err.data,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==============================================
  // LOGOUT
  // ==============================================

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await adminLogout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setLoading(false);
    }
  }, []);

  // ==============================================
  // REFRESH AUTH
  // ==============================================

  const refreshAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await checkAdminAuth();

      if (response) {
        setUser(response.user || authService.getUser());
        setIsAuthenticated(true);
        return { success: true };
      } else {
        await logout();
        return { success: false, error: "Authentication failed" };
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to refresh authentication";
      setError(errorMessage);
      await logout();
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // ==============================================
  // UPDATE USER
  // ==============================================

  const updateUser = useCallback((updatedUser) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedUser };
      authService.setUser(newUser);
      return newUser;
    });
  }, []);

  // ==============================================
  // CHECK PERMISSION
  // ==============================================

  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;
      
      // Check if user is superadmin
      if (user.is_superuser || user.is_staff) return true;

      // Check specific permissions
      if (user.permissions && Array.isArray(user.permissions)) {
        return user.permissions.includes(permission);
      }

      return false;
    },
    [user]
  );

  // ==============================================
  // CHECK ROLE
  // ==============================================

  const hasRole = useCallback(
    (role) => {
      if (!user) return false;

      if (user.role === role) return true;

      if (user.roles && Array.isArray(user.roles)) {
        return user.roles.includes(role);
      }

      return false;
    },
    [user]
  );

  // ==============================================
  // CONTEXT VALUE
  // ==============================================

  const value = {
    // State
    user,
    loading,
    error,
    isAuthenticated,

    // Methods
    login,
    logout,
    refreshAuth,
    updateUser,
    hasPermission,
    hasRole,

    // Auth service utilities
    getAccessToken: authService.getAccessToken,
    isTokenExpired: authService.isTokenExpired,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

// ==============================================
// CUSTOM HOOK
// ==============================================

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }

  return context;
}

// ==============================================
// PROTECTED ROUTE COMPONENT
// ==============================================

export function AdminProtectedRoute({ children, requiredPermission, requiredRole, fallback }) {
  const { isAuthenticated, loading, hasPermission, hasRole } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    );
  }

  // Check role if required
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600">Your role doesn't have access to this page.</p>
          </div>
        </div>
      )
    );
  }

  return children;
}

export default AdminAuthContext;
