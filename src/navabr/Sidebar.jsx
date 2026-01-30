// src/navbar/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Mountain, 
  Calendar, 
  Users, 
  BarChart3,
  FileText,
  X,
  Plane,
  Cloud,  // ✅ ADD THIS
  ListChecks
} from "lucide-react";

const Sidebar = ({ activeItem, isMobileOpen, setIsMobileOpen }) => {
  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
    { path: "/treks", icon: Mountain, label: "Treks", key: "treks" },
    { path: "/tours", icon: Plane, label: "Tours", key: "tours" },
    // { path: "/cloudinary", icon: Cloud, label: "Cloudinary", key: "cloudinary" },  // ✅ ADD THIS
    { path: "/bookings", icon: Calendar, label: "Bookings", key: "bookings" },
    { path: "/blogs", icon: FileText, label: "Blogs", key: "blogs" },
    { path: "/users", icon: Users, label: "Users", key: "users" },
    { path: "/customize-trip", icon: ListChecks, label: "Customize Trip", key: "customize-trip" },
    {path: "/travel-styles", icon: BarChart3, label: "Travel Styles", key: "travel-styles" },
    {path: "/travel-info", icon: BarChart3, label: "Travel Info", key: "travel-info" },
  ];
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-800 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div className="flex items-center gap-1">
            <div className="w-23 h-22 rounded-lg overflow-hidden">
              <img 
                src="/logo.webp" 
                alt="EverTrekNepal Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold">EverTrekNepal</span>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-teal-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-slate-700 hover:text-white"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700">
          <p className="text-xs text-gray-400">© 2025 EverTrekNepal</p>
          <p className="text-xs text-gray-500">Version 1.0.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
