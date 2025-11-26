import React from "react";

const UserInfo = ({ user }) => (
  <div className="max-w-lg mx-auto mt-12 bg-white rounded-xl shadow-lg p-8">
    <div className="flex items-center gap-6 mb-8">
      {user.avatar ? (
        <img
          src={user.avatar}
          alt="Profile Avatar"
          className="w-24 h-24 rounded-full object-cover border"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-teal-600 text-white flex items-center justify-center text-3xl font-bold">
          {(user.name || "Admin")[0]}
        </div>
      )}
      <div>
        <h1 className="font-bold text-2xl mb-1">{user.name || "Admin User"}</h1>
        <p className="text-slate-500">{user.role || "Administrator"}</p>
        <p className="text-slate-500">{user.email || "admin@yourdomain.com"}</p>
      </div>
    </div>
    <hr className="my-4" />
    <div className="text-slate-700 space-y-2">
      <div>
        <span className="font-semibold">Joined:</span> {user.createdAt || ""}
      </div>
      <div>
        <span className="font-semibold">Last Login:</span> {user.lastLogin || ""}
      </div>
      <div>
        <span className="font-semibold">Phone:</span> {user.phone || ""}
      </div>
      <div>
        <span className="font-semibold">Address:</span> {user.address || ""}
      </div>
    </div>
  </div>
);

export default UserInfo;
