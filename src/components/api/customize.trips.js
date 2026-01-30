// src/components/api/customize.trips.js
import adminApi from "./admin.api";

const BASE = "/customize-trip/";  // ✅ FIXED: Removed /requests/admin/

export const fetchAdminCustomizeTripRequests = (params = {}) => {
  return adminApi.get(BASE, { params });
};

export const fetchAdminCustomizeTripRequest = (requestRef) => {
  return adminApi.get(`${BASE}${requestRef}/`);
};

export const updateAdminCustomizeTripRequest = (requestRef, payload) => {
  return adminApi.patch(`${BASE}${requestRef}/`, payload);
};
