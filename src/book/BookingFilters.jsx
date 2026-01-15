import React from "react";

const BookingFilters = ({
  statusFilter,
  dateRange,
  onStatusChange,
  onDateRangeChange,
  onClear,
}) => {
  const handleStatusChange = (e) => {
    onStatusChange(e.target.value);
  };

  const handleDateChange = (field, value) => {
    onDateRangeChange({
      ...dateRange,
      [field]: value,
    });
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        {/* Status */}
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

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
  );
};

export default BookingFilters;
