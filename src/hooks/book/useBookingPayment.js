// src/hooks/useBookingPayment.js
import { useState, useCallback } from "react";
import { useAuth } from "../../components/api/AuthContext";
import { TOAST_TYPES } from "../../components/utils/constants";

const API_BASE = import.meta.env.VITE_ADMIN_API_BASE_URL || "http://127.0.0.1:8000/api";

export const useBookingPayment = (showToast) => {
  const { getAuthHeader } = useAuth();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Create payment intent
  const createPaymentIntent = useCallback(
    async (bookingRef) => {
      setPaymentLoading(true);
      setPaymentError(null);
      try {
        const response = await fetch(
          `${API_BASE}/bookings/${bookingRef}/payment-intent/`,
          {
            method: "POST",
            headers: getAuthHeader(),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail || `Failed to create payment intent`
          );
        }

        const data = await response.json();
        console.log("✅ Payment intent created:", data);
        return data;
      } catch (err) {
        console.error("❌ Error creating payment intent:", err);
        setPaymentError(err.message);
        showToast(err.message, TOAST_TYPES.ERROR);
        throw err;
      } finally {
        setPaymentLoading(false);
      }
    },
    [getAuthHeader, showToast]
  );

  // Create checkout session (Stripe hosted checkout)
  const createCheckoutSession = useCallback(
    async (bookingRef) => {
      setPaymentLoading(true);
      setPaymentError(null);
      try {
        const response = await fetch(
          `${API_BASE}/bookings/${bookingRef}/checkout-session/`,
          {
            method: "POST",
            headers: getAuthHeader(),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail || `Failed to create checkout session`
          );
        }

        const data = await response.json();
        console.log("✅ Checkout session created:", data);

        // Redirect to Stripe checkout if URL provided
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        }

        return data;
      } catch (err) {
        console.error("❌ Error creating checkout session:", err);
        setPaymentError(err.message);
        showToast(err.message, TOAST_TYPES.ERROR);
        throw err;
      } finally {
        setPaymentLoading(false);
      }
    },
    [getAuthHeader, showToast]
  );

  // Update billing details
  const updateBillingDetails = useCallback(
    async (bookingRef, billingData) => {
      setPaymentLoading(true);
      setPaymentError(null);
      try {
        const response = await fetch(
          `${API_BASE}/bookings/${bookingRef}/billing-details/`,
          {
            method: "PATCH",
            headers: {
              ...getAuthHeader(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(billingData),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to update billing details`);
        }

        const data = await response.json();
        showToast("✅ Billing details updated", TOAST_TYPES.SUCCESS);
        return data;
      } catch (err) {
        console.error("❌ Error updating billing details:", err);
        setPaymentError(err.message);
        showToast(err.message, TOAST_TYPES.ERROR);
        throw err;
      } finally {
        setPaymentLoading(false);
      }
    },
    [getAuthHeader, showToast]
  );

  // Mark booking as paid (DEV only)
  const markBookingAsPaid = useCallback(
    async (bookingRef) => {
      setPaymentLoading(true);
      setPaymentError(null);
      try {
        const response = await fetch(
          `${API_BASE}/bookings/${bookingRef}/mark-paid/`,
          {
            method: "POST",
            headers: getAuthHeader(),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to mark booking as paid`);
        }

        const data = await response.json();
        showToast("✅ Booking marked as paid", TOAST_TYPES.SUCCESS);
        return data;
      } catch (err) {
        console.error("❌ Error marking paid:", err);
        setPaymentError(err.message);
        showToast(err.message, TOAST_TYPES.ERROR);
        throw err;
      } finally {
        setPaymentLoading(false);
      }
    },
    [getAuthHeader, showToast]
  );

  return {
    paymentLoading,
    paymentError,
    createPaymentIntent,
    createCheckoutSession,
    updateBillingDetails,
    markBookingAsPaid,
  };
};

export default useBookingPayment;