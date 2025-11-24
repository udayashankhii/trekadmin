"use client";

import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Button,
  FormControl,
  FormHelperText,
  Stack,
  TextField,
  Typography,
  Box,
} from "@mui/material";

const adminLoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const AdminLoginForm = () => {
  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={adminLoginSchema}
      onSubmit={(values, { setSubmitting }) => {
        console.log("Admin login data:", values);
        setSubmitting(false);
      }}
    >
      {(formik) => (
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{
            maxWidth: 400,
            margin: "auto",
            padding: 4,
            borderRadius: 2,
            boxShadow: 3,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            backgroundColor: "background.paper",
          }}
        >
          <Typography variant="h4" color="text.secondary" textAlign="center">
            Admin Login
          </Typography>

          <FormControl fullWidth>
            <TextField
              label="Email"
              type="email"
              {...formik.getFieldProps("email")}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </FormControl>

          <FormControl fullWidth>
            <TextField
              label="Password"
              type="password"
              {...formik.getFieldProps("password")}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
          </FormControl>

          <Stack direction="row" justifyContent="center">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={formik.isSubmitting}
              fullWidth
            >
              Login
            </Button>
          </Stack>
        </Box>
      )}
    </Formik>
  );
};

export default AdminLoginForm;
