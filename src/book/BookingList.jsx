import React from "react";
import { Eye, Trash2 } from "lucide-react";
import { formatDate, formatCurrency } from "../components/utils/formatters";
import Badge from "../components/ui/Badge";

const BookingList = ({ bookings, loading, onView, onDelete }) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm p-4 animate-pulse space-y-3"
          >
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            <div className="flex justify-between mt-2">
              <div className="h-6 bg-gray-200 rounded w-20" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-lg shadow-sm">
        <p className="text-gray-600">No bookings found for current filters.</p>
      </div>
    );
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case "paid":
      case "confirmed":
        return "success";
      case "pending_payment":
      case "pending":
        return "warning";
      case "cancelled":
      case "failed":
        return "danger";
      case "draft":
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: "Draft",
      pending_payment: "Pending Payment",
      paid: "Paid",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      failed: "Failed",
    };
    return labels[status] || status;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {bookings.map((booking) => (
        <div
          key={booking.public_id || booking.booking_ref}
          className="bg-white rounded-lg shadow-sm p-5 flex flex-col justify-between border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs text-gray-500">
                {formatDate(booking.created_at)}
              </p>
              <Badge variant={getStatusVariant(booking.status)}>
                {getStatusLabel(booking.status)}
              </Badge>
            </div>

            <h3 className="text-base font-semibold text-gray-900">
              {booking.booking_ref}
            </h3>

            <p className="text-sm text-gray-700">
              {booking.trek_title || "Unknown trek"}
            </p>

            <div className="mt-2 text-sm text-gray-600">
              <p className="font-medium">
                {booking.lead_name || "No customer name"}
              </p>
              <p className="text-xs text-gray-500">
                {booking.lead_email || "No email"}
              </p>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                {booking.party_size}{" "}
                {booking.party_size === 1 ? "person" : "people"}
              </span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(booking.total_amount, booking.currency)}
              </span>
            </div>

            <p className="mt-1 text-xs text-gray-500">
              {formatDate(booking.start_date)} →{" "}
              {formatDate(booking.end_date)}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              onClick={() => onView(booking)}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
            <button
              onClick={() => onDelete(booking.booking_ref)}
              className="inline-flex items-center justify-center px-3 py-2 text-sm text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingList;
