// src/context/AuthContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true
};

// Check token validity on initialization
const initializeAuth = () => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    try {
      const decoded = jwtDecode(token);
      
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('auth_token');
        return initialState;
      }
      
      return {
        user: decoded,
        token,
        isAuthenticated: true,
        isLoading: false
      };
    } catch (error) {
      localStorage.removeItem('auth_token');
      return { ...initialState, isLoading: false };
    }
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
      return {
        ...initialState,
        isLoading: false
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState, initializeAuth);

  // Auto-logout when token expires
  useEffect(() => {
    if (state.token) {
      try {
        const decoded = jwtDecode(state.token);
        const expiresIn = decoded.exp * 1000 - Date.now();
        
        if (expiresIn > 0) {
          const timer = setTimeout(() => {
            logout();
          }, expiresIn);
          
          return () => clearTimeout(timer);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    }
  }, [state.token]);

  const login = async (credentials) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const { token, user } = data;

      // Store token in localStorage
      localStorage.setItem('auth_token', token);

      dispatch({
        type: 'LOGIN',
        payload: { user, token }
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    dispatch({ type: 'LOGOUT' });
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
    updateUser
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
