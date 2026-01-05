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

const RegisterAdminPanel = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/accounts/register/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Admin registered successfully!");
        setTimeout(() => {
          navigate("/admin/login");
        }, 1500);
      } else {
        toast.error(data.detail || "Registration failed");
      }
    } catch (error) {
      toast.error("Server connection error");
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
          maxWidth: 420,
          width: "100%",
          p: 4,
          borderRadius: 3,
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
        }}
      >
        <Typography variant="h4" textAlign="center" mb={2}>
          Admin Registration
        </Typography>

        <form onSubmit={handleRegister}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <TextField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </FormControl>

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
                autoComplete="new-password"
              />
            </FormControl>

            <FormControl fullWidth>
              <TextField
                label="Confirm Password"
                name="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
              />
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default RegisterAdminPanel;
