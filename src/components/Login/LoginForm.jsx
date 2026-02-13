// src/components/Login/LoginForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";

import { useAdminAuth } from "../api/admin.service";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      general: "",
    };

    const trimmedEmail = formData.email.trim();
    const trimmedPassword = formData.password.trim();

    if (!trimmedEmail) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!trimmedPassword) {
      newErrors.password = "Password is required";
    } else if (trimmedPassword.length < 3) {
      newErrors.password = "Password must be at least 3 characters";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleBackendError = (error) => {
    const newErrors = {
      email: "",
      password: "",
      general: "",
    };

    // Handle different status codes
    if (error.status === 400) {
      const detail = error.data?.detail;
      
      // Check if detail contains password-related error
      if (detail && typeof detail === "string") {
        const lowerDetail = detail.toLowerCase();
        
        if (lowerDetail.includes("password")) {
          newErrors.password = detail;
        } else if (lowerDetail.includes("email")) {
          newErrors.email = detail;
        } else if (lowerDetail.includes("credentials") || lowerDetail.includes("invalid")) {
          newErrors.general = detail;
        } else {
          newErrors.general = detail;
        }
      }
      
      // Handle field-specific errors from backend
      if (error.data?.email) {
        newErrors.email = Array.isArray(error.data.email) 
          ? error.data.email.join(", ") 
          : error.data.email;
      }
      
      if (error.data?.password) {
        newErrors.password = Array.isArray(error.data.password) 
          ? error.data.password.join(", ") 
          : error.data.password;
      }
      
      // If no specific field error, show as general
      if (!newErrors.email && !newErrors.password && !newErrors.general) {
        newErrors.general = error.message || "Invalid request. Please check your input.";
      }
    } else if (error.status === 401) {
      newErrors.general = "Invalid credentials. Please check your email and password.";
    } else if (error.status === 403) {
      newErrors.general = "Access denied. Admin privileges required.";
    } else if (error.status === 404) {
      newErrors.general = "Service not found. Please contact support.";
    } else if (error.status >= 500) {
      newErrors.general = "Server error. Please try again later.";
    } else {
      newErrors.general = error.message || "Login failed. Please try again.";
    }

    setErrors(newErrors);
    
    // Return a user-friendly message for toast if needed
    return newErrors.general || "Please check the form for errors.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({ email: "", password: "", general: "" });

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const trimmedEmail = formData.email.trim();
      const trimmedPassword = formData.password.trim();

      const result = await login(trimmedEmail, trimmedPassword);

      if (result.success) {
        toast.success("Login successful! Redirecting...");
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 300);
      } else {
        // Handle error from result
        if (result.error) {
          const errorObj = typeof result.error === 'object' ? result.error : { message: result.error };
          handleBackendError(errorObj);
        } else {
          setErrors((prev) => ({ 
            ...prev, 
            general: "Login failed. Please try again." 
          }));
        }
      }
    } catch (error) {
      handleBackendError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h4"
          fontWeight={600}
          textAlign="center"
          mb={1}
        >
          Admin Login
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mb={3}
        >
          Sign in to access the admin panel
        </Typography>

        <form onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            {/* General Error Alert */}
            {errors.general && (
              <Alert 
                severity="error" 
                sx={{ mb: 1 }}
                onClose={() => setErrors((prev) => ({ ...prev, general: "" }))}
              >
                {errors.general}
              </Alert>
            )}

            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              required
              fullWidth
              autoComplete="username"
              disabled={loading}
              placeholder="admin@example.com"
              inputProps={{
                'aria-label': 'Email address',
                'aria-required': 'true',
              }}
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              required
              fullWidth
              autoComplete="current-password"
              disabled={loading}
              inputProps={{
                'aria-label': 'Password',
                'aria-required': 'true',
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
              sx={{ height: 48 }}
              aria-label={loading ? "Logging in" : "Login"}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Login"
              )}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginForm;