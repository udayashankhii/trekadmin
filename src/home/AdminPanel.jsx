import { useState } from "react";
import Sidebar from "../navabr/Sidebar";
import TopNavbar from "../navabr/TopNavbar";
import AnalyticsPage from "./AnalyticsPage";
import BookingsPage from "./BookingsPage";
import DashboardPage from "./DashboardPage";
import TreksPage from "./TreksPage";
import UsersPage from "./UsersPage";
import BlogPage from "./Blogs";

const AdminPanel = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getPageTitle = () => {
    const titles = {
      dashboard: { title: 'Admin Dashboard', subtitle: 'Welcome back, Admin' },
      treks: { title: 'Treks Management', subtitle: 'Manage all your trek packages' },
      bookings: { title: 'Bookings', subtitle: 'Track and manage all bookings' },
      blogs: { title: 'Blogs Admin', subtitle: 'Review and manage blog stories' }, // ← Added blogs
      users: { title: 'Users Management', subtitle: 'Manage user accounts' },
      analytics: { title: 'Analytics', subtitle: 'View insights and reports' }
    };
    return titles[activeItem] || titles.dashboard;
  };

  const renderPage = () => {
    switch (activeItem) {
      case 'dashboard': return <DashboardPage />;
      case 'treks': return <TreksPage />;
      case 'bookings': return <BookingsPage />;
      case 'blogs': return <BlogPage />; // ← Added blogs
      case 'users': return <UsersPage />;
      case 'analytics': return <AnalyticsPage />;
      default: return <DashboardPage />;
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        activeItem={activeItem}
        setActiveItem={setActiveItem}
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
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
