// src/pages/LogoutPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { adminLogout } from "../components/api/admin.api";

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        // Backend logout + token cleanup handled inside adminLogout
        await adminLogout();
      } catch (error) {
        // Even if backend fails, local logout must succeed
        console.warn("Logout error (ignored):", error);
      } finally {
        toast.info("You have been logged out.");

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1000);
      }
    };

    logout();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded shadow px-6 py-10 text-center">
        <h2 className="text-xl font-semibold mb-3 text-slate-800">
          Logging out…
        </h2>
        <p className="text-slate-500">
          Redirecting to login page.
        </p>
      </div>
    </div>
  );
};

export default LogoutPage;
