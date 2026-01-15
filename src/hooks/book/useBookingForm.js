// src/hooks/useBookingForm.js
import { useState, useCallback } from "react";
import { useAuth } from "../../components/api/AuthContext";
import { TOAST_TYPES } from "../../components/utils/constants";

const API_BASE = import.meta.env.VITE_ADMIN_API_BASE_URL || "http://127.0.0.1:8000/api";

export const useBookingForm = (showToast) => {
  const { getAuthHeader } = useAuth();
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState(null);

  // Get booking quote
  const getQuote = useCallback(
    async (trekSlug, partySize, bookingIntent = null) => {
      setFormLoading(true);
      setFormError(null);
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
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail ||
              errorData.error ||
              "Failed to get quote"
          );
        }

        const quote = await response.json();
        console.log("✅ Quote received:", quote);
        return quote;
      } catch (err) {
        console.error("❌ Error getting quote:", err);
        setFormError(err.message);
        throw err;
      } finally {
        setFormLoading(false);
      }
    },
    [getAuthHeader]
  );

  // Validate booking form
  const validateForm = useCallback((data) => {
    const errors = {};

    // Required fields
    if (!data.trek_slug) errors.trek_slug = "Trek is required";
    if (!data.party_size) errors.party_size = "Party size is required";
    if (data.party_size < 1) errors.party_size = "Party size must be at least 1";
    if (!data.start_date) errors.start_date = "Start date is required";
    if (!data.end_date) errors.end_date = "End date is required";
    if (!data.lead_name && !(data.lead_first_name && data.lead_last_name)) {
      errors.lead_name = "Lead name or (first & last name) is required";
    }
    if (!data.lead_email) errors.lead_email = "Email is required";
    if (data.lead_email && !isValidEmail(data.lead_email)) {
      errors.lead_email = "Invalid email format";
    }

    // Date validation
    if (data.start_date && data.end_date) {
      if (new Date(data.start_date) > new Date(data.end_date)) {
        errors.end_date = "End date must be after start date";
      }
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  }, []);

  // Submit booking form
  const submitBooking = useCallback(
    async (bookingData) => {
      const { isValid, errors } = validateForm(bookingData);
      if (!isValid) {
        setFormError(errors);
        showToast("Please fix form errors", TOAST_TYPES.ERROR);
        return { success: false, errors };
      }

      setFormLoading(true);
      setFormError(null);
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
          const errorMsg = Object.entries(errorData)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
            .join("; ");
          throw new Error(errorMsg || "Failed to create booking");
        }

        const booking = await response.json();
        setFormData(booking);
        showToast(
          `✅ Booking created: ${booking.booking_ref}`,
          TOAST_TYPES.SUCCESS
        );
        console.log("✅ Booking created:", booking);
        return { success: true, booking };
      } catch (err) {
        console.error("❌ Error submitting booking:", err);
        const errorMsg = err.message || "Failed to create booking";
        setFormError(errorMsg);
        showToast(errorMsg, TOAST_TYPES.ERROR);
        return { success: false, error: errorMsg };
      } finally {
        setFormLoading(false);
      }
    },
    [getAuthHeader, validateForm, showToast]
  );

  return {
    formLoading,
    formError,
    formData,
    getQuote,
    submitBooking,
    validateForm,
  };
};

// Helper: Validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default useBookingForm;