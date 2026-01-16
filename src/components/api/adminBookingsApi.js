// src/api/adminBookingsApi.js
import api from "./axios.js"; // axios instance with interceptors

/**
 * Fetch all bookings
 * GET /api/admin/bookings/
 * Optional filters as query params
 */
export async function getAllBookings(filters = {}) {
  const queryParams = new URLSearchParams(filters).toString();
  const url = `/bookings/${queryParams ? `?${queryParams}` : ""}`;
  return api.get(url);
}

/**
 * Fetch single booking by reference
 * GET /api/admin/bookings/:bookingRef/
 */
export async function getBookingByRef(bookingRef) {
  return api.get(`/bookings/${bookingRef}/`);
}

/**
 * Update a booking partially
 * PATCH /api/admin/bookings/:bookingRef/
 */
export async function updateBooking(bookingRef, updates) {
  return api.patch(`/bookings/${bookingRef}/`, updates);
}

/**
 * Delete a booking
 * DELETE /api/admin/bookings/:bookingRef/
 */
export async function deleteBooking(bookingRef) {
  return api.delete(`/bookings/${bookingRef}/`);
}

export default {
  getAllBookings,
  getBookingByRef,
  updateBooking,
  deleteBooking,
};
