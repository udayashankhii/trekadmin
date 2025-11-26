// ProfileMenu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Dropdown from "../ui/Dropdown";

const ProfileMenu = ({ user }) => {
  const navigate = useNavigate();
  const initials = user?.name
    ? user.name.split(" ").map(word => word[0]).join("").toUpperCase()
    : "A";
  return (
    <Dropdown
      trigger={
        <button className="flex items-center gap-3 focus:outline-none">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {user?.name || "Admin User"}
            </p>
            <p className="text-xs text-slate-500">
              {user?.role || "Administrator"}
            </p>
          </div>
          {user?.avatar ? (
            <img src={user.avatar} alt="profile"
              className="w-10 h-10 rounded-full object-cover border border-slate-200"/>
          ) : (
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
              {initials}
            </div>
          )}
        </button>
      }
    >
      <div className="py-1">
        <button
          className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50"
          onClick={() => navigate("/profile")}
        >
          View Profile
        </button>
        <button
          className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50"
          onClick={() => navigate("/settings")}
        >
          Settings
        </button>
        <button
          className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>
    </Dropdown>
  );
};

export default ProfileMenu;
