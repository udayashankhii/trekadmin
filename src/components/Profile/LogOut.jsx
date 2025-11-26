// LogoutPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Step 1: Clear authentication/session info
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    // Step 2: Show confirmation toast
    toast.info("You have been logged out.");

    // Step 3: Redirect to login page after brief delay (optional)
    setTimeout(() => {
      navigate("/login");
    }, 1200);
  }, [navigate]);

  // Step 4: Optionally show immediate feedback while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded shadow px-6 py-10 text-center">
        <h2 className="text-xl font-semibold mb-3 text-slate-800">Logging out...</h2>
        <p className="text-slate-500">You will be redirected to login.</p>
      </div>
    </div>
  );
};

export default LogoutPage;
