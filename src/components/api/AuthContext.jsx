

import { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true
};

// ✅ Native JWT decode (no jwt-decode needed)
const decodeJWT = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const isTokenValid = (token) => {
  const decoded = decodeJWT(token);
  return decoded && decoded.exp * 1000 > Date.now();
};

const initializeAuth = () => {
  const token = localStorage.getItem('auth_token');
  
  if (token && isTokenValid(token)) {
    return {
      user: decodeJWT(token),
      token,
      isAuthenticated: true,
      isLoading: false
    };
  }
  
  return { ...initialState, isLoading: false };
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState, initializeAuth);
  const navigate = useNavigate();

  useEffect(() => {
    if (state.token) {
      const decoded = decodeJWT(state.token);
      if (decoded) {
        const expiresIn = decoded.exp * 1000 - Date.now();
        if (expiresIn > 0) {
          const timer = setTimeout(logout, expiresIn);
          return () => clearTimeout(timer);
        }
      }
      logout();
    }
  }, [state.token]);

  const login = async (credentials) => {
    try {
      const response = await fetch('/api/admin/auth/login/', {  // ✅ Your admin API
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      const { token, user } = data;

      localStorage.setItem('auth_token', token);
      dispatch({ type: 'LOGIN', payload: { user, token } });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    dispatch({ type: 'LOGOUT' });
    navigate('/login', { replace: true });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    logout,
    updateUser,
  getAuthHeader: () => {
  const headers = { "Content-Type": "application/json" };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  return headers;
}

  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
