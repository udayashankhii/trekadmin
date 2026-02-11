import React, { useState, useEffect } from "react";

const BookingFilters = ({
  statusFilter,
  dateRange,
  trekFilter, // New prop
  onStatusChange,
  onDateRangeChange,
  onTrekChange, // New prop
  onClear,
}) => {
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch available treks on component mount
  useEffect(() => {
    const fetchTreks = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/treks/"); // Adjust your API endpoint
        const data = await response.json();
        setTreks(data.results || data); // Adjust based on your API response structure
      } catch (error) {
        console.error("Error fetching treks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTreks();
  }, []);

  const handleStatusChange = (e) => {
    onStatusChange(e.target.value);
  };

  const handleTrekChange = (e) => {
    onTrekChange(e.target.value);
  };

  const handleDateChange = (field, value) => {
    onDateRangeChange({
      ...dateRange,
      [field]: value,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* First row - Trek and Status */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Trek Filter */}
        <div className="w-full sm:flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trek
          </label>
          <select
            value={trekFilter}
            onChange={handleTrekChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">All Treks</option>
            {loading ? (
              <option disabled>Loading treks...</option>
            ) : (
              treks.map((trek) => (
                <option key={trek.id} value={trek.id}>
                  {trek.name} {/* Adjust based on your trek model field */}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Second row - Date Range and Clear Button */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Date From */}
          <div className="w-full sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date (from)
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => handleDateChange("from", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Date To */}
          <div className="w-full sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date (to)
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => handleDateChange("to", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Clear button */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClear}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingFilters;
