import React from "react";
import { Bell, Menu } from "lucide-react";
import ProfileMenu from "../components/Profile/ProfileMenu";

const TopNavbar = ({ setIsMobileOpen, title, subtitle }) => {
  const user = {
    name: "Admin User",
    role: "Administrator",
    avatar: null, // You can add an image URL here
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-0 lg:left-64 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden text-slate-600 hover:text-slate-900"
          >
            <Menu size={24} />
          </button>

          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <button className="relative text-slate-600 hover:text-slate-900">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
          </button>

          <ProfileMenu user={user} />
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
