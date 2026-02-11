// src/components/bookings/BookingsDataTable.jsx
import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  Eye,
  MoreHorizontal,
  Search,
  Trash2,
  X,
} from "lucide-react";

import Badge from "../components/ui/Badge";
import { formatCurrency, formatDate } from "../components/utils/formatters";

const statusMeta = {
  draft: { label: "Draft", variant: "secondary" },
  pending_payment: { label: "Pending Payment", variant: "warning" },
  pending: { label: "Pending", variant: "warning" },
  paid: { label: "Paid", variant: "success" },
  confirmed: { label: "Confirmed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
  failed: { label: "Failed", variant: "danger" },
};

const BookingsDataTable = ({
  data,
  loading,
  treks, // New prop: list of all treks
  treksLoading, // New prop
  globalQuery,
  onGlobalQueryChange,
  statusFilter,
  onStatusFilterChange,
  trekFilter, // New prop
  onTrekFilterChange, // New prop
  dateRange,
  onDateRangeChange,
  onClearFilters,
  onView,
  onDelete,
}) => {
  const [sorting, setSorting] = React.useState([{ id: "created_at", desc: true }]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: "booking_ref",
        header: "Booking ID",
        cell: ({ row }) => (
          <div>
            <div className="font-mono text-sm font-semibold text-gray-900">
              {row.original.booking_ref}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(row.original.created_at)}
            </div>
          </div>
        ),
      },
      { accessorKey: "trek_title", header: "Trek" },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900">{row.original.lead_name}</div>
            <div className="text-xs text-gray-500">{row.original.lead_email}</div>
          </div>
        ),
      },
      {
        accessorKey: "party_size",
        header: "Party",
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {row.original.party_size} {row.original.party_size === 1 ? "person" : "people"}
          </span>
        ),
      },
      {
        accessorKey: "start_date",
        header: "Start",
        cell: ({ row }) => <span>{formatDate(row.original.start_date)}</span>,
      },
      {
        accessorKey: "total_amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="font-semibold text-gray-900">
            {formatCurrency(row.original.total_amount, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const meta = statusMeta[row.original.status] || {
            label: row.original.status,
            variant: "secondary",
          };
          return <Badge variant={meta.variant}>{meta.label}</Badge>;
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => onView(row.original)}
              className="rounded-lg border bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-50"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </button>

            <button
              onClick={() => onDelete(row.original.booking_ref)}
              className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 shadow-sm hover:bg-red-100"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [onDelete, onView]
  );

  // Pre-filter with memoization for performance
  const prefiltered = React.useMemo(() => {
    const from = dateRange?.from ? new Date(dateRange.from) : null;
    const to = dateRange?.to ? new Date(dateRange.to) : null;

    return (data || []).filter((b) => {
      // Trek filter
      if (trekFilter && trekFilter !== "all") {
        // Match by trek ID or trek slug based on your data structure
        const trekMatch = 
          b.trek_id === parseInt(trekFilter) || 
          b.trek === trekFilter ||
          b.trek_slug === trekFilter;
        
        if (!trekMatch) return false;
      }

      // Status filter
      if (statusFilter && statusFilter !== "all" && b.status !== statusFilter) {
        return false;
      }

      // Date range filter
      if (from) {
        const d = new Date(b.start_date);
        if (d < from) return false;
      }
      if (to) {
        const d = new Date(b.start_date);
        if (d > to) return false;
      }

      return true;
    });
  }, [data, trekFilter, statusFilter, dateRange?.from, dateRange?.to]);

  const table = useReactTable({
    data: prefiltered,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter: globalQuery,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue || "").toLowerCase().trim();
      if (!q) return true;
      const b = row.original;

      return (
        b.booking_ref?.toLowerCase().includes(q) ||
        b.lead_name?.toLowerCase().includes(q) ||
        b.lead_email?.toLowerCase().includes(q) ||
        b.trek_title?.toLowerCase().includes(q)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Count active filters for UX feedback
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (trekFilter && trekFilter !== "all") count++;
    if (statusFilter && statusFilter !== "all") count++;
    if (dateRange?.from) count++;
    if (dateRange?.to) count++;
    return count;
  }, [trekFilter, statusFilter, dateRange]);

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-gradient-to-b from-white to-gray-50 p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={globalQuery}
              onChange={(e) => onGlobalQueryChange(e.target.value)}
              className="w-full rounded-xl border bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Trek Filter */}
            <select
              value={trekFilter}
              onChange={(e) => onTrekFilterChange(e.target.value)}
              disabled={treksLoading}
              className="rounded-xl border bg-white px-3 py-2 text-sm min-w-[200px] disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="all">All Treks</option>
              {treksLoading ? (
                <option disabled>Loading treks...</option>
              ) : (
                treks?.map((trek) => (
                  <option key={trek.id} value={trek.id}>
                    {trek.title || trek.name}
                  </option>
                ))
              )}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="rounded-xl border bg-white px-3 py-2 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="failed">Failed</option>
              <option value="draft">Draft</option>
            </select>

            {/* Date Range */}
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
              className="rounded-xl border bg-white px-3 py-2 text-sm"
              placeholder="From"
            />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
              className="rounded-xl border bg-white px-3 py-2 text-sm"
              placeholder="To"
            />

            {/* Clear Button */}
            {activeFilterCount > 0 && (
              <button
                onClick={onClearFilters}
                className="rounded-xl border bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear {activeFilterCount > 1 && `(${activeFilterCount})`}
              </button>
            )}
          </div>
        </div>

        {/* Meta line */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div>
            {table.getFilteredSelectedRowModel().rows.length > 0
              ? `${table.getFilteredSelectedRowModel().rows.length} selected`
              : "No selection"}
          </div>
          <div>
            Showing {table.getFilteredRowModel().rows.length} of {data?.length || 0}
            {activeFilterCount > 0 && " (filtered)"}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-semibold text-gray-700"
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        className="inline-flex items-center gap-2 hover:text-gray-900"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: "↑",
                          desc: "↓",
                        }[header.column.getIsSorted()] ?? ""}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td className="px-4 py-10 text-center text-gray-500" colSpan={columns.length}>
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    Loading bookings...
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/70">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-10 text-center text-gray-500" colSpan={columns.length}>
                  {activeFilterCount > 0 ? (
                    <div className="flex flex-col items-center gap-2">
                      <p className="font-medium">No bookings match your filters</p>
                      <button
                        onClick={onClearFilters}
                        className="text-sm text-blue-600 hover:text-blue-700 underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  ) : (
                    "No bookings found."
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-3 text-sm">
        <div className="text-xs text-gray-500">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingsDataTable;
