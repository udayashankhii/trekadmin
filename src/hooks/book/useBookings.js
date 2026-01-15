// / src/hooks/useBookings.js
import { useState, useCallback } from "react";
import { useAuth } from "../../components/api/AuthContext";
import { TOAST_TYPES } from "../../components/utils/constants";

const API_BASE = import.meta.env.VITE_ADMIN_API_BASE_URL || "http://127.0.0.1:8000/api";

export const useBookings = (showToast) => {
  const { getAuthHeader } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all bookings
  const fetchBookings = useCallback(
    async (filters = {}) => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });

        const url = `${API_BASE}/bookings/?${queryParams.toString()}`;
     const response = await fetch(url, {
  headers: getAuthHeader(),  // ✅ This now works
});

        if (!response.ok) {
          throw new Error(`Failed to fetch bookings: ${response.statusText}`);
        }

        const data = await response.json();
        const bookingsList = data.results || data;
        setBookings(Array.isArray(bookingsList) ? bookingsList : []);
        return bookingsList;
      } catch (err) {
        console.error("❌ Error fetching bookings:", err);
        setError(err.message);
        showToast(err.message, TOAST_TYPES.ERROR);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeader, showToast]
  );

  // Fetch single booking by ref
  const fetchBookingByRef = useCallback(
    async (bookingRef) => {
      try {
        const response = await fetch(`${API_BASE}/bookings/${bookingRef}/`, {
          headers: getAuthHeader(),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch booking: ${response.statusText}`);
        }

        return await response.json();
      } catch (err) {
        console.error("❌ Error fetching booking:", err);
        throw err;
      }
    },
    [getAuthHeader]
  );

  // Create new booking
  const createBooking = useCallback(
    async (bookingData) => {
      try {
        const response = await fetch(`${API_BASE}/bookings/`, {
          method: "POST",
          headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail ||
              errorData.error ||
              `Failed to create booking: ${response.statusText}`
          );
        }

        const booking = await response.json();
        setBookings((prev) => [booking, ...prev]);
        showToast("✅ Booking created successfully", TOAST_TYPES.SUCCESS);
        return booking;
      } catch (err) {
        console.error("❌ Error creating booking:", err);
        showToast(err.message, TOAST_TYPES.ERROR);
        throw err;
      }
    },
    [getAuthHeader, showToast]
  );

  // Update booking
  const updateBooking = useCallback(
    async (bookingRef, updates) => {
      try {
        const response = await fetch(`${API_BASE}/bookings/${bookingRef}/`, {
          method: "PATCH",
          headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error(`Failed to update booking: ${response.statusText}`);
        }

        const updatedBooking = await response.json();
        setBookings((prev) =>
          prev.map((b) => (b.booking_ref === bookingRef ? updatedBooking : b))
        );
        showToast("✅ Booking updated", TOAST_TYPES.SUCCESS);
        return updatedBooking;
      } catch (err) {
        console.error("❌ Error updating booking:", err);
        showToast(err.message, TOAST_TYPES.ERROR);
        throw err;
      }
    },
    [getAuthHeader, showToast]
  );

  // Delete booking
  const deleteBooking = useCallback(
    async (bookingRef) => {
      try {
        const response = await fetch(`${API_BASE}/bookings/${bookingRef}/`, {
          method: "DELETE",
          headers: getAuthHeader(),
        });

        if (!response.ok) {
          throw new Error(`Failed to delete booking: ${response.statusText}`);
        }

        setBookings((prev) =>
          prev.filter((b) => b.booking_ref !== bookingRef)
        );
        showToast("✅ Booking deleted", TOAST_TYPES.SUCCESS);
        return true;
      } catch (err) {
        console.error("❌ Error deleting booking:", err);
        showToast(err.message, TOAST_TYPES.ERROR);
        return false;
      }
    },
    [getAuthHeader, showToast]
  );

  // Get booking quote
  const getBookingQuote = useCallback(
    async (trekSlug, partySize, bookingIntent = null) => {
      try {
        const payload = {
          trek_slug: trekSlug,
          party_size: partySize,
        };
        if (bookingIntent) {
          payload.booking_intent = bookingIntent;
        }

        const response = await fetch(`${API_BASE}/bookings/quote/`, {
          method: "POST",
          headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to get quote: ${response.statusText}`);
        }

        return await response.json();
      } catch (err) {
        console.error("❌ Error getting quote:", err);
        throw err;
      }
    },
    [getAuthHeader]
  );

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    fetchBookingByRef,
    createBooking,
    updateBooking,
    deleteBooking,
    getBookingQuote,
  };
};

export default useBookings;