import { AdminAPI } from "../api/admin.api";

export const getDashboardData = async () => {
  const res = await AdminAPI.dashboardStats();
  return res.data;
};
