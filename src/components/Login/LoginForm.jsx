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
  });

  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
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

  const getErrorMessage = (error) => {
    if (error.status === 400) {
      const detail = error.data?.detail;
      if (detail) return detail;
      if (error.data?.email) return `Email: ${error.data.email.join(", ")}`;
      if (error.data?.password) return `Password: ${error.data.password.join(", ")}`;
      if (error.message) return error.message;
    }
    
    if (error.status === 401) return "Invalid credentials. Please check your email and password.";
    if (error.status === 403) return "Access denied. Admin access required.";
    if (error.message) return error.message;
    
    return "Login failed. Please try again.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
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
        const errorMessage = result.error || "Login failed. Please try again.";
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
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
