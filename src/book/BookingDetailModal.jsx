import React from "react";
import {
  X,
  Trash2,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
} from "lucide-react";
import { formatDate, formatCurrency } from "../components/utils/formatters";
import Badge from "../components/ui/Badge";

const BookingDetailModal = ({
  isOpen,
  onClose,
  booking,
  loading,
  onDelete,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <p className="text-xs font-mono text-gray-500">
              {booking?.booking_ref || "Booking"}
            </p>
            <h2 className="text-lg font-semibold text-gray-900">
              Booking Details
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {booking && (
              <Badge variant={getStatusVariant(booking.status)}>
                {getStatusLabel(booking.status)}
              </Badge>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
              <span className="text-gray-600">Loading booking...</span>
            </div>
          )}

          {!loading && !booking && (
            <div className="text-center py-10 text-gray-600">
              Booking not found.
            </div>
          )}

          {!loading && booking && (
            <div className="space-y-6 text-sm">
              {/* Trek + dates */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Trek
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-2">
                  <div className="font-medium text-gray-900">
                    {booking.trek_title}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-gray-700">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{formatDate(booking.start_date)}</span>
                      <span className="mx-1">→</span>
                      <span>{formatDate(booking.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>
                        {booking.party_size}{" "}
                        {booking.party_size === 1 ? "person" : "people"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Customer */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Customer
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <p className="font-medium text-gray-900">
                    {booking.lead_name}
                  </p>
                  <div className="flex flex-wrap gap-3 text-gray-700">
                    {booking.lead_email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-4 h-4 text-gray-500" />
                        {booking.lead_email}
                      </span>
                    )}
                    {booking.lead_phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-4 h-4 text-gray-500" />
                        {booking.lead_phone}
                      </span>
                    )}
                    {booking.form_details?.country && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {booking.form_details.country}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* Additional (if present) */}
              {booking.form_details && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Additional Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {booking.form_details.experience_level && (
                      <div>
                        <p className="text-gray-500 text-xs">Experience</p>
                        <p className="font-medium text-gray-900">
                          {booking.form_details.experience_level}
                        </p>
                      </div>
                    )}
                    {booking.form_details.dietary_requirements && (
                      <div>
                        <p className="text-gray-500 text-xs">
                          Dietary Requirements
                        </p>
                        <p className="font-medium text-gray-900">
                          {booking.form_details.dietary_requirements}
                        </p>
                      </div>
                    )}
                    {booking.form_details.medical_conditions && (
                      <div>
                        <p className="text-gray-500 text-xs">
                          Medical Conditions
                        </p>
                        <p className="font-medium text-gray-900">
                          {booking.form_details.medical_conditions}
                        </p>
                      </div>
                    )}
                    {booking.form_details.special_requests && (
                      <div className="sm:col-span-2">
                        <p className="text-gray-500 text-xs">
                          Special Requests
                        </p>
                        <p className="font-medium text-gray-900 whitespace-pre-line">
                          {booking.form_details.special_requests}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Price */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Payment
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(
                        booking.total_amount,
                        booking.currency
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Created {formatDate(booking.created_at)}
                  </p>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Close
          </button>

          {booking && (
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4" />
              Delete Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;
