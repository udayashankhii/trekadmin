

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Button,
  FormControl,
  TextField,
  Typography,
  Box,
  Paper,
  Stack,
} from "@mui/material";

const LoginAdminPanel = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/accounts/login/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        localStorage.setItem("role", data.role);

        toast.success("Login successful!");
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 1500);
      } else {
        toast.error(data.detail || "Invalid credentials");
      }
    } catch (error) {
      toast.error("Error connecting to server.");
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ToastContainer position="top-right" />
      <Paper
        elevation={8}
        sx={{
          maxWidth: 400,
          width: "100%",
          p: 4,
          borderRadius: 3,
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
        }}
      >
        <Typography
          variant="h4"
          color="text.primary"
          textAlign="center"
          mb={2}
        >
          Admin Login
        </Typography>
        <form onSubmit={handleLogin}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </FormControl>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Stack>
        </form>
     
      </Paper>
    </Box>
  );
};

export default LoginAdminPanel;
