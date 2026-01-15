// src/components/bookings/BookingTable.jsx
import React, { useState } from "react";
import { Eye, Trash2, MoreVertical, ChevronUp, ChevronDown } from "lucide-react";
import Badge from "../components/ui/Badge";
import { formatDate, formatCurrency } from "../components/utils/formatters";

const BookingTable = ({
  bookings,
  loading,
  onView,
  onDelete,
  onEdit,
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const [selectedBookings, setSelectedBookings] = useState([]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return null;
  }

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const toggleSelectBooking = (bookingId) => {
    setSelectedBookings((prev) =>
      prev.includes(bookingId)
        ? prev.filter((id) => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedBookings(
      selectedBookings.length === bookings.length
        ? []
        : bookings.map((b) => b.public_id)
    );
  };

  const SortHeader = ({ label, sortKey }) => (
    <button
      onClick={() => handleSort(sortKey)}
      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
    >
      {label}
      {sortConfig.key === sortKey ? (
        sortConfig.direction === "asc" ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )
      ) : (
        <div className="w-4 h-4" />
      )}
    </button>
  );

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
        return "secondary";
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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={selectedBookings.length === bookings.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 text-left font-medium text-gray-700">
                <SortHeader label="Booking ID" sortKey="booking_ref" />
              </th>
              <th className="px-6 py-4 text-left font-medium text-gray-700">
                <SortHeader label="Trek" sortKey="trek_title" />
              </th>
              <th className="px-6 py-4 text-left font-medium text-gray-700">
                <SortHeader label="Customer" sortKey="lead_name" />
              </th>
              <th className="px-6 py-4 text-left font-medium text-gray-700">
                <SortHeader label="Party Size" sortKey="party_size" />
              </th>
              <th className="px-6 py-4 text-left font-medium text-gray-700">
                <SortHeader label="Start Date" sortKey="start_date" />
              </th>
              <th className="px-6 py-4 text-left font-medium text-gray-700">
                <SortHeader label="Amount" sortKey="total_amount" />
              </th>
              <th className="px-6 py-4 text-left font-medium text-gray-700">
                <SortHeader label="Status" sortKey="status" />
              </th>
              <th className="px-6 py-4 text-center font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedBookings.map((booking) => (
              <tr
                key={booking.public_id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedBookings.includes(booking.public_id)}
                    onChange={() => toggleSelectBooking(booking.public_id)}
                    className="rounded border-gray-300 cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-mono font-semibold text-gray-900">
                      {booking.booking_ref}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(booking.created_at)}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-900">{booking.trek_title}</p>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.lead_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.lead_email}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {booking.party_size} person{booking.party_size !== 1 ? "s" : ""}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-900">{formatDate(booking.start_date)}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(booking.total_amount, booking.currency)}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={getStatusVariant(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onView(booking)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(booking.booking_ref)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete booking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
        <div>
          {selectedBookings.length > 0 && (
            <p className="font-medium">
              {selectedBookings.length} booking(s) selected
            </p>
          )}
        </div>
        <div className="text-xs text-gray-500">
          Total: {bookings.length} bookings
        </div>
      </div>
    </div>
  );
};

export default BookingTable;