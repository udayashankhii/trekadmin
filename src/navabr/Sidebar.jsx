import React from 'react';
import {
  LayoutDashboard,
  Mountain,
  Calendar,
  Users,
  BarChart3,
  X,
  BookOpen,
} from 'lucide-react';

const Sidebar = ({
  activeItem,
  setActiveItem,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'treks', icon: Mountain, label: 'Treks' },
    { id: 'bookings', icon: Calendar, label: 'Bookings' },
     { id: 'blogs', icon: BookOpen, label: 'Blogs' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-800 z-50 transform
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-2 h-16 px-6 border-b border-slate-700">
          <img src="/logo.webp" alt="EvertrekNepal Logo" className="w-21 h-15" />

          <h1 className="text-xl font-bold text-white">EverTrekNepal</h1>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden ml-auto text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveItem(item.id);
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg
                text-sm font-medium transition-all
                ${
                  activeItem === item.id
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }
              `}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="text-xs text-slate-400">
            <p>© 2025 EverTrekNepal</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
