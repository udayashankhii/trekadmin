// src/home/AdminPanel.jsx
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../navabr/Sidebar";
import TopNavbar from "../navabr/TopNavbar";

const AdminPanel = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Get active item from current URL path
  const getActiveItem = () => {
    const path = location.pathname.split('/')[1]; // Get first segment after /
    return path || 'dashboard';
  };

  const activeItem = getActiveItem();

  // Get page title based on current route
  const getPageTitle = () => {
    const titles = {
      dashboard: { title: 'Admin Dashboard', subtitle: 'Welcome back, Admin' },
      treks: { title: 'Treks Management', subtitle: 'Manage all your trek packages' },
      bookings: { title: 'Bookings', subtitle: 'Track and manage all bookings' },
      blogs: { title: 'Blogs Admin', subtitle: 'Review and manage blog stories' },
      users: { title: 'Users Management', subtitle: 'Manage user accounts' },
      analytics: { title: 'Analytics', subtitle: 'View insights and reports' }
    };
    return titles[activeItem] || titles.dashboard;
  };

  const { title, subtitle } = getPageTitle();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        activeItem={activeItem}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <TopNavbar
        setIsMobileOpen={setIsMobileOpen}
        title={title}
        subtitle={subtitle}
      />
      <main className="lg:ml-64 pt-16">
        <div className="p-6 lg:p-8">
          {/* 🔥 Outlet renders the child route components */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
