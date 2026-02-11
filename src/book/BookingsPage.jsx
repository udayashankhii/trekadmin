// src/pages/BookingsPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Download, RefreshCw } from "lucide-react";
import useBookings from "../hooks/book/useBookings";
import { useToast } from "../hooks/useToast";

import BookingsDataTable from "./BookingsDataTable";
import BookingDetailModal from "./BookingDetailModal";

import { formatCurrency, formatDate } from "../components/utils/formatters";

const BookingsPage = () => {
  const { showToast } = useToast();
  const { bookings, loading, fetchBookings, fetchBookingByRef, deleteBooking } =
    useBookings(showToast);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [bookingDetailLoading, setBookingDetailLoading] = useState(false);

  // Trek state
  const [treks, setTreks] = useState([]);
  const [treksLoading, setTreksLoading] = useState(false);

  // Filter states
  const [globalQuery, setGlobalQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [trekFilter, setTrekFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Fetch treks on mount with error handling
  useEffect(() => {
    const fetchTreks = async () => {
      setTreksLoading(true);
      try {
        const response = await fetch("/api/treks/"); // Adjust your endpoint
        if (!response.ok) throw new Error("Failed to fetch treks");
        
        const data = await response.json();
        setTreks(data.results || data); // Adjust based on your API response
      } catch (error) {
        console.error("Error fetching treks:", error);
        showToast("Failed to load treks", "error");
      } finally {
        setTreksLoading(false);
      }
    };

    fetchTreks();
  }, [showToast]);

  // Load booking detail when modal opens
  useEffect(() => {
    if (detailModalOpen && selectedBooking) loadBookingDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailModalOpen]);

  const loadBookingDetail = async () => {
    setBookingDetailLoading(true);
    try {
      const detail = await fetchBookingByRef(selectedBooking.booking_ref);
      setBookingDetail(detail);
    } catch (error) {
      showToast("Failed to load booking details", "error");
    } finally {
      setBookingDetailLoading(false);
    }
  };

  // Memoized filtered bookings for better performance
  const filteredBookings = useMemo(() => {
    if (!bookings?.length) return [];

    return bookings.filter((b) => {
      const q = globalQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        b.booking_ref?.toLowerCase().includes(q) ||
        b.lead_name?.toLowerCase().includes(q) ||
        b.lead_email?.toLowerCase().includes(q) ||
        b.trek_title?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Trek filter
      if (trekFilter !== "all") {
        const trekMatch = 
          b.trek_id === parseInt(trekFilter) || 
          b.trek === trekFilter ||
          b.trek_slug === trekFilter;
        
        if (!trekMatch) return false;
      }

      // Status filter
      if (statusFilter !== "all" && b.status !== statusFilter) return false;

      // Date range filter
      if (dateRange.from) {
        const d = new Date(b.start_date);
        if (d < new Date(dateRange.from)) return false;
      }
      if (dateRange.to) {
        const d = new Date(b.start_date);
        if (d > new Date(dateRange.to)) return false;
      }

      return true;
    });
  }, [bookings, globalQuery, trekFilter, statusFilter, dateRange]);

  const handleViewBooking = useCallback((booking) => {
    setSelectedBooking(booking);
    setBookingDetail(null);
    setDetailModalOpen(true);
  }, []);

  const handleDeleteBooking = useCallback(async (bookingRef) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    
    try {
      await deleteBooking(bookingRef);
      await fetchBookings();
      showToast("Booking deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete booking", "error");
    }
  }, [deleteBooking, fetchBookings, showToast]);

  const handleExport = useCallback(() => {
    if (filteredBookings.length === 0) {
      showToast("No bookings to export", "warning");
      return;
    }

    const csv = generateCSV(filteredBookings);
    downloadCSV(csv, `bookings_${new Date().toISOString().split('T')[0]}.csv`);
    showToast(`✅ ${filteredBookings.length} bookings exported`, "success");
  }, [filteredBookings, showToast]);

  const handleClearFilters = useCallback(() => {
    setGlobalQuery("");
    setStatusFilter("all");
    setTrekFilter("all");
    setDateRange({ from: "", to: "" });
  }, []);

  // Summary statistics for the header
  const stats = useMemo(() => {
    const total = filteredBookings.length;
    const paid = filteredBookings.filter(b => b.status === "paid").length;
    const pending = filteredBookings.filter(b => b.status === "pending_payment").length;
    
    return { total, paid, pending };
  }, [filteredBookings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Bookings
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track and manage all trek and tour bookings.
          </p>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="text-gray-600">
              <span className="font-semibold text-gray-900">{stats.total}</span> total
            </span>
            <span className="text-gray-600">
              <span className="font-semibold text-green-600">{stats.paid}</span> paid
            </span>
            <span className="text-gray-600">
              <span className="font-semibold text-yellow-600">{stats.pending}</span> pending
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={handleExport}
            disabled={loading || filteredBookings.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <BookingsDataTable
        data={filteredBookings}
        loading={loading}
        treks={treks}
        treksLoading={treksLoading}
        globalQuery={globalQuery}
        onGlobalQueryChange={setGlobalQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        trekFilter={trekFilter}
        onTrekFilterChange={setTrekFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onClearFilters={handleClearFilters}
        onView={handleViewBooking}
        onDelete={handleDeleteBooking}
      />

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

// CSV Generation utility
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

  return [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
};

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
