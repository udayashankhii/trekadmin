import React from 'react';
import { Bell, Menu } from 'lucide-react';
import Dropdown from '../components/ui/Dropdown';

const TopNavbar = ({ setIsMobileOpen, title, subtitle }) => (
  <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-0 lg:left-64 z-30">
    <div className="h-full px-6 flex items-center justify-between">
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
      <div className="flex items-center gap-4">
        <button className="relative text-slate-600 hover:text-slate-900">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
        </button>
        <Dropdown
          trigger={
            <button className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">Admin User</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
                A
              </div>
            </button>
          }
        >
          <button className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50">Profile</button>
          <button className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50">Settings</button>
          <button className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50">Logout</button>
        </Dropdown>
      </div>
    </div>
  </header>
);

export default TopNavbar;
