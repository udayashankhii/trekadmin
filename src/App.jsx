// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider, AdminProtectedRoute } from "./components/api/admin.service";

import AdminPanel from "./home/AdminPanel";
import DashboardPage from "./home/DashboardPage";
import BookingsPage from "./home/BookingsPage";
import TreksPage from "./treks/TreksPage";
import UsersPage from "./home/UsersPage";
import AnalyticsPage from "./home/AnalyticsPage";
import BlogPage from "./home/Blogs";
import AdminLoginForm from "./components/Login/LoginForm";
import TrekEditPage from "./treks/model/TrekEditPage";

function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <Routes>
          {/* Login page - standalone (public) */}
          <Route path="/login" element={<AdminLoginForm />} />

          {/* Admin Panel Layout with nested routes (protected) */}
          <Route
            path="/"
            element={
              <AdminProtectedRoute>
                <AdminPanel />
              </AdminProtectedRoute>
            }
          >
            {/* Default redirect to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Admin routes */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="treks">
              <Route index element={<TreksPage />} />
              <Route path="edit/:slug" element={<TrekEditPage />} />
            </Route>
            
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="blogs" element={<BlogPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>

          {/* Fallback - redirect unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AdminAuthProvider>
    </Router>
  );
}

export default App;
