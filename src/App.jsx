// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import AdminPanel from "./home/AdminPanel";
import DashboardPage from "./home/DashboardPage";
import BookingsPage from "./home/BookingsPage";
import TreksPage from "./home/TreksPage";
import UsersPage from "./home/UsersPage";
import AdminLoginForm from "./components/Login/LoginForm";
import ProfileMenu from "./components/Profile/ProfileMenu";
import UserInfo from "./components/Profile/UserInfo";
import SettingsPage from "./components/Profile/Settings";
import { exampleUser } from "./data/mockData";
function App() {
  return (
    <Router>
      <Routes>

        {/* Login page */}
        <Route path="/login" element={<AdminLoginForm />} />

        {/* Admin layout for all admin routes */}
        <Route path="/" element={<AdminPanel />}>
          <Route index element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/treks" element={<TreksPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>

        {/* Wildcard fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/" element={<ProfileMenu />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />

<Route path="/profile" element={<UserInfo user={exampleUser} />} />
        <Route path="/settings" element={<SettingsPage user={exampleUser} />} />
        
      </Routes>
    </Router>
  );
}

export default App;
