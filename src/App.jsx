import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";  // ✅ Import BOTH
import { AdminAuthProvider, AdminProtectedRoute } from "./components/api/admin.service";
import { AuthProvider } from "./components/api/AuthContext.jsx";

import AdminPanel from "./home/AdminPanel";
import DashboardPage from "./home/DashboardPage";
import BookingsPage from "./book/BookingsPage";
import TreksPage from "./treks/TreksPage";
import UsersPage from "./home/UsersPage";
import AnalyticsPage from "./home/AnalyticsPage";
import BlogPage from "./home/Blogs";
import AdminLoginForm from "./components/Login/LoginForm";
import TrekEditPage from "./treks/model/TrekEditPage";
import ToursPage from "./tours/ToursPage";
import CloudinaryImport from "./cloudinary/CloudinaryImport.jsx";
import CustomizeTripRequestsPage from "./customize-trips/CustomizeTripRequestsPage.jsx";
import TravelInfoAdminPage from "./components/pages/TravelInfoAdminPage.jsx";
import TravelStylesAdminPage from "./components/pages/TravelStylesAdminPage.jsx";

// ✅ CREATE QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <Router>
      {/* ✅ QueryClientProvider WRAPS everything */}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
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
                <Route path="tours" element={<ToursPage />} />
                <Route path="cloudinary" element={<CloudinaryImport />} />
                {/* ✅ MOVED INSIDE AdminPanel, no leading slash */}
                <Route path="customize-trip" element={<CustomizeTripRequestsPage />} />
                <Route path="travel-styles" element={<TravelStylesAdminPage />} />
                <Route path="travel-info" element={<TravelInfoAdminPage />} />


              </Route>

              {/* Fallback - redirect unknown routes to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AdminAuthProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
