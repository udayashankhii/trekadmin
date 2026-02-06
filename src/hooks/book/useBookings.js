// src/hooks/useBookings.js
import { useState, useCallback } from "react";
import { TOAST_TYPES } from "../../components/utils/constants";
import { useAuth } from "../../components/api/AuthContext";
import bookingsApi from "../../components/api/adminBookingsApi";

export const useBookings = (showToast) => {
  const { getAuthHeader } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -----------------------------
  // Fetch all bookings with filters
  // -----------------------------
const fetchBookings = useCallback(
  async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await bookingsApi.getAllBookings(filters);
      // Axios wraps data inside `response.data`
      const list = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      console.log("Fetched bookings list:", list);
      setBookings(list);
      return list;
    } catch (err) {
      console.error("❌ Error fetching bookings:", err);

      const msg =
        err.response?.data?.detail || err.message || "Failed to fetch bookings";
      setError(msg);
      showToast(msg, "error");
      return [];
    } finally {
      setLoading(false);
    }
  },
  [showToast]
);


  // -----------------------------
  // Fetch single booking by reference
  // -----------------------------
// ✅ CORRECTED CODE
const fetchBookingByRef = useCallback(
  async (bookingRef) => {
    try {
      console.log("🔍 Fetching booking detail for:", bookingRef);
      const response = await bookingsApi.getBookingByRef(bookingRef);
      
      // ✅ Properly unwrap axios response
      const data = response.data;
      console.log("✅ Booking detail fetched:", data);
      
      return data;
    } catch (err) {
      console.error("❌ Error fetching booking detail:", err);
      const msg = err.response?.data?.detail || err.message || "Failed to fetch booking";
      showToast(msg, TOAST_TYPES.ERROR);
      throw err;
    }
  },
  [showToast]
);


  // -----------------------------
  // Update booking
  // -----------------------------
  const updateBookingByRef = useCallback(
    async (bookingRef, updates) => {
      try {
        const updated = await bookingsApi.updateBooking(bookingRef, updates);
        setBookings((prev) =>
          prev.map((b) => (b.booking_ref === bookingRef ? updated : b))
        );
        showToast("✅ Booking updated", TOAST_TYPES.SUCCESS);
        return updated;
      } catch (err) {
        console.error("❌ Error updating booking:", err);
        throw new Error("Failed to update booking");
      }
    },
    [showToast]
  );

  // -----------------------------
  // Delete booking
  // -----------------------------
  const deleteBookingByRef = useCallback(
    async (bookingRef) => {
      try {
        await bookingsApi.deleteBooking(bookingRef);
        setBookings((prev) =>
          prev.filter((b) => b.booking_ref !== bookingRef)
        );
        showToast("✅ Booking deleted", TOAST_TYPES.SUCCESS);
        return true;
      } catch (err) {
        console.error("❌ Error deleting booking:", err);
        throw new Error("Failed to delete booking");
      }
    },
    [showToast]
  );

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    fetchBookingByRef,
    updateBookingByRef,
    deleteBookingByRef,
  };
};

export default useBookings;
