import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Dummy user fallback for demo
const defaultUser = {
  name: "Sudip Aryal",
  email: "sudip@domain.com",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  role: "Administrator",
  notifications: true,
  createdAt: "2024-01-15",
};

const SettingsPage = ({ user, onUserUpdate }) => {
  // Always fallback to dummy user if not provided
  const baseUser = user || defaultUser;

  const [form, setForm] = useState({
    name: baseUser.name,
    email: baseUser.email,
    avatar: baseUser.avatar,
    password: "",
    notifications: baseUser.notifications,
    role: baseUser.role,
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // If user prop updates, also update form
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        password: "",
        notifications: user.notifications,
        role: user.role,
      });
    }
  }, [user]);

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
    if (file) {
      setForm((f) => ({
        ...f,
        avatar: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Build FormData (avatar, password, etc.)
    const formDataObj = new FormData();
    formDataObj.append("name", form.name);
    formDataObj.append("email", form.email);
    formDataObj.append("role", form.role);
    formDataObj.append("notifications", form.notifications);
    if (avatarFile) formDataObj.append("avatar", avatarFile);
    if (form.password) formDataObj.append("password", form.password);

    try {
      // PATCH to backend if connected, leave demo for now
      // const response = await fetch(...);
      // const data = await response.json();
      // Simulate success
      setTimeout(() => {
        setLoading(false);
        toast.success("Settings updated!");
        if (onUserUpdate) onUserUpdate({ ...form, avatar: form.avatar });
      }, 900);
    } catch {
      setLoading(false);
      toast.error("Failed to update settings.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <ToastContainer position="top-right" />
      <form
        className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Account Settings</h2>

        <div className="mb-6 flex gap-4 items-center">
          {form.avatar ? (
            <img src={form.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-teal-600 text-white flex items-center justify-center text-2xl font-bold">
              {(form.name || "U")[0]}
            </div>
          )}
          <div>
            <input
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="block"
            />
            <span className="text-xs text-gray-500">Update profile photo</span>
          </div>
        </div>

        <label className="block mb-2 font-semibold">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full mb-4 px-3 py-2 border rounded focus:outline-none"
          required
        />

        <label className="block mb-2 font-semibold">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-4 px-3 py-2 border rounded focus:outline-none"
          required
        />

        <label className="block mb-2 font-semibold">Change Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="New Password"
          className="w-full mb-4 px-3 py-2 border rounded focus:outline-none"
        />

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            name="notifications"
            checked={form.notifications}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="font-medium">Receive notifications</label>
        </div>

        <label className="block mb-2 font-semibold">Role</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full mb-4 px-3 py-2 border rounded"
        >
          <option value="Administrator">Administrator</option>
          <option value="Editor">Editor</option>
          <option value="Viewer">Viewer</option>
        </select>

        <button
          className="w-full bg-blue-600 text-white py-2 font-semibold rounded hover:bg-blue-700 transition"
          type="submit"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
