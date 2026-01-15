// src/pages/BookingsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Plus, RefreshCw, Filter, Download, Search } from "lucide-react";
import { useToast } from "../hooks/useToast";
import useBookings from "../hooks/book/useBookings";
import BookingList from "./BookingList";
import BookingTable from "./BookingTable.jsx";
import BookingDetailModal from "./BookingDetailModal.jsx";
import BookingFilters from "./BookingFilters.jsx";
import { formatCurrency, formatDate } from "../components/utils/formatters";

const BookingsPage = () => {
  const { showToast } = useToast();
  const {
    bookings,
    loading,
    fetchBookings,
    fetchBookingByRef,
    deleteBooking,
  } = useBookings(showToast);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [bookingDetailLoading, setBookingDetailLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [viewMode, setViewMode] = useState("table"); // table or list
  const [page, setPage] = useState(1);

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Fetch booking detail when modal opens
  useEffect(() => {
    if (detailModalOpen && selectedBooking) {
      loadBookingDetail();
    }
  }, [detailModalOpen]);

  const loadBookingDetail = async () => {
    setBookingDetailLoading(true);
    try {
      const detail = await fetchBookingByRef(selectedBooking.booking_ref);
      setBookingDetail(detail);
    } catch (err) {
      console.error("Error loading booking detail:", err);
    } finally {
      setBookingDetailLoading(false);
    }
  };

  // Filter bookings
  const filteredBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];

    return bookings.filter((booking) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        booking.booking_ref?.toLowerCase().includes(searchLower) ||
        booking.lead_name?.toLowerCase().includes(searchLower) ||
        booking.lead_email?.toLowerCase().includes(searchLower) ||
        booking.trek_title?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter && booking.status !== statusFilter) {
        return false;
      }

      // Date range filter
      if (dateRange.from) {
        const bookingDate = new Date(booking.start_date);
        if (bookingDate < new Date(dateRange.from)) return false;
      }
      if (dateRange.to) {
        const bookingDate = new Date(booking.start_date);
        if (bookingDate > new Date(dateRange.to)) return false;
      }

      return true;
    });
  }, [bookings, searchQuery, statusFilter, dateRange]);

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setDetailModalOpen(true);
  };

  const handleDeleteBooking = async (bookingRef) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }
    await deleteBooking(bookingRef);
    fetchBookings();
  };

  const handleExport = () => {
    const csv = generateCSV(filteredBookings);
    downloadCSV(csv, "bookings.csv");
    showToast("✅ Bookings exported", "success");
  };

  const handleRefresh = () => {
    fetchBookings();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setDateRange({ from: "", to: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">
            Manage all trek and tour bookings
          </p>
        </div>
        <button
          onClick={() => setViewMode(viewMode === "table" ? "list" : "table")}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {viewMode === "table" ? "List View" : "Table View"}
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by booking ID, customer, trek..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleExport}
            disabled={loading || filteredBookings.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>

        {/* Filters */}
        <BookingFilters
          statusFilter={statusFilter}
          dateRange={dateRange}
          onStatusChange={setStatusFilter}
          onDateRangeChange={setDateRange}
          onClear={handleClearFilters}
        />

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredBookings.length} of {bookings.length} bookings
          {searchQuery && ` (filtered from search)`}
        </div>
      </div>

      {/* Content */}
      {viewMode === "table" ? (
        <BookingTable
          bookings={filteredBookings}
          loading={loading}
          onView={handleViewBooking}
          onDelete={handleDeleteBooking}
        />
      ) : (
        <BookingList
          bookings={filteredBookings}
          loading={loading}
          onView={handleViewBooking}
          onDelete={handleDeleteBooking}
        />
      )}

      {/* Empty State */}
      {!loading && bookings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600 mb-4">No bookings yet</p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Booking
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <BookingDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        booking={bookingDetail || selectedBooking}
        loading={bookingDetailLoading}
        onDelete={() => {
          handleDeleteBooking(selectedBooking.booking_ref);
          setDetailModalOpen(false);
        }}
      />
    </div>
  );
};

// Helper: Generate CSV
const generateCSV = (bookings) => {
  const headers = [
    "Booking ID",
    "Trek",
    "Customer",
    "Email",
    "Party Size",
    "Start Date",
    "End Date",
    "Amount",
    "Status",
    "Created",
  ];

  const rows = bookings.map((b) => [
    b.booking_ref,
    b.trek_title,
    b.lead_name,
    b.lead_email,
    b.party_size,
    formatDate(b.start_date),
    formatDate(b.end_date),
    formatCurrency(b.total_amount, b.currency),
    b.status,
    formatDate(b.created_at),
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((r) => r.map((v) => `"${v}"`).join(",")),
  ].join("\n");

  return csv;
};

// Helper: Download CSV
const downloadCSV = (csv, filename) => {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default BookingsPage;