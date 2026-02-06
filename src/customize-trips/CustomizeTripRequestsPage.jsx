import { Loader2, RefreshCw, ListChecks, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminCustomizeTripRequest,
  fetchAdminCustomizeTripRequests,
  updateAdminCustomizeTripRequest,
} from "../components/api/customize.trips";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "in_review", label: "In review" },
  { value: "quote_sent", label: "Quote sent" },
  { value: "confirmed", label: "Confirmed" },
  { value: "closed", label: "Closed" },
];

const statusBadgeClass = (status) => {
  switch (status) {
    case "new":
      return "bg-blue-500 text-white";
    case "in_review":
      return "bg-amber-500 text-white";
    case "quote_sent":
      return "bg-indigo-500 text-white";
    case "confirmed":
      return "bg-emerald-500 text-white";
    case "closed":
      return "bg-gray-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const formatDate = (value) => {
  if (!value) return "TBD";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const formatTimestamp = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

// Skeleton loading component for table rows
const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-slate-700 rounded"></div>
        <div className="h-4 w-32 bg-slate-700 rounded"></div>
        <div className="h-3 w-40 bg-slate-700 rounded"></div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="space-y-2">
        <div className="h-4 w-36 bg-slate-700 rounded"></div>
        <div className="h-3 w-20 bg-slate-700 rounded"></div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-24 bg-slate-700 rounded"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-28 bg-slate-700 rounded"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-6 w-20 bg-slate-700 rounded-full"></div>
    </td>
  </tr>
);

// Skeleton for detail panel
const DetailPanelSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="space-y-2">
      <div className="h-3 w-20 bg-slate-700 rounded"></div>
      <div className="h-6 w-48 bg-slate-700 rounded"></div>
    </div>
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/40 p-6">
        <div className="h-3 w-32 bg-slate-700 rounded"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="flex justify-between">
              <div className="h-4 w-24 bg-slate-700 rounded"></div>
              <div className="h-4 w-32 bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default function CustomizeTripRequestsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRef, setSelectedRef] = useState(null);
  const debouncedSearch = useDebouncedValue(search, 500);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["customizeTripRequests", debouncedSearch, statusFilter, page],
    queryFn: () =>
      fetchAdminCustomizeTripRequests({
        page,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      }),
    keepPreviousData: true,
  });

  const requests = useMemo(() => data?.results || data?.items || [], [data]);

  useEffect(() => {
    const firstRef = requests[0]?.request_ref;
    if (!selectedRef && firstRef) {
      setSelectedRef(firstRef);
    }
  }, [requests, selectedRef]);

  const detailQuery = useQuery({
    queryKey: ["customizeTripRequest", selectedRef],
    enabled: Boolean(selectedRef),
    queryFn: () => fetchAdminCustomizeTripRequest(selectedRef),
    keepPreviousData: true,
  });

  const selectedRequest = detailQuery.data;

  const statusMutation = useMutation({
    mutationFn: ({ requestRef, status }) =>
      updateAdminCustomizeTripRequest(requestRef, { status }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: ["customizeTripRequests"],
      });
      queryClient.invalidateQueries({
        queryKey: ["customizeTripRequest", updated.request_ref],
      });
      setSelectedRef(updated.request_ref);
    },
  });

  const totalCount = data?.count ?? requests.length;
  const pageSize = data?.page_size || 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="page-section space-y-8">
      {/* Header */}
      <header className="page-section__header">
        <div className="space-y-2">
          <p className="eyebrow flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <ListChecks size={16} className="text-teal-400" />
            Customize trip requests
          </p>
          <h2 className="text-3xl font-bold text-slate-50">Tailored trek enquiries</h2>
          <p className="text-base text-slate-400 max-w-2xl">
            Track bespoke requests, review contact details, and move each request through status updates.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="button button--primary inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      {/* Search & Filters */}
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search by trek, name, email, or request ID"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X size={18} />
            </button>
          )}
          {isFetching && (
            <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-teal-400" />
          )}
        </div>
        <select
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-100 transition-colors focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/20"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(340px,420px)]">
        {/* Table Section */}
        <section className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/50 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/50">
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Request
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Trip
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Group
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isLoading ? (
                  <>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRowSkeleton key={i} />
                    ))}
                  </>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-slate-800 p-4">
                          <ListChecks size={32} className="text-slate-600" />
                        </div>
                        <p className="text-lg font-medium text-slate-400">No requests found</p>
                        <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr
                      key={request.request_ref}
                      className={`cursor-pointer transition-all duration-150 hover:bg-slate-800/70 focus-within:bg-slate-800/70 ${
                        selectedRef === request.request_ref ? "bg-slate-800 ring-2 ring-inset ring-teal-500/30" : ""
                      }`}
                      onClick={() => setSelectedRef(request.request_ref)}
                      tabIndex={0}
                      role="button"
                      aria-pressed={selectedRef === request.request_ref}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedRef(request.request_ref);
                        }
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-xs font-mono uppercase tracking-wider text-slate-500">
                            {request.request_ref}
                          </div>
                          <div className="text-sm font-semibold text-slate-100">{request.contact_name}</div>
                          <div className="text-xs text-slate-400">{request.contact_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-slate-100">
                            {request.trip_name || "Unknown trek"}
                          </div>
                          <div className="text-xs text-slate-500">{request.trip_slug || "Custom"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{formatDate(request.preferred_start_date)}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {request.adults} adult{request.adults !== 1 ? "s" : ""}
                        {request.children ? ` · ${request.children} child${request.children !== 1 ? "ren" : ""}` : ""}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${statusBadgeClass(
                            request.status
                          )}`}
                        >
                          {STATUS_OPTIONS.find((opt) => opt.value === request.status)?.label || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-700 bg-slate-800/30 px-6 py-4">
            <span className="text-sm text-slate-400">
              Showing <span className="font-medium text-slate-200">{requests.length}</span> of{" "}
              <span className="font-medium text-slate-200">{totalCount}</span> requests
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-slate-900"
                disabled={page <= 1}
              >
                Previous
              </button>
              <span className="text-sm text-slate-400">
                Page <span className="font-medium text-slate-200">{page}</span> of{" "}
                <span className="font-medium text-slate-200">{totalPages}</span>
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-slate-900"
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* Detail Panel */}
        <aside className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/50 shadow-xl">
            <div className="border-b border-slate-700 bg-slate-800/50 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Selected request</p>
                  <h3 className="mt-1 truncate text-xl font-bold text-slate-50">
                    {selectedRequest?.trip_name || "No selection"}
                  </h3>
                </div>
                <span className="shrink-0 text-xs font-mono uppercase tracking-wider text-slate-500">
                  {selectedRequest?.request_ref ?? "—"}
                </span>
              </div>
            </div>

            <div className="p-6">
              {detailQuery.isFetching && !selectedRequest ? (
                <DetailPanelSkeleton />
              ) : selectedRequest ? (
                <div className="space-y-6">
                  {/* Trip Basics */}
                  <section className="space-y-4 rounded-xl border border-slate-700 bg-slate-800/30 p-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trip basics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-400">Trek:</span>
                        <span className="text-sm font-medium text-slate-100 text-right">
                          {selectedRequest.trip_name || "Custom"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-400">Slug:</span>
                        <span className="text-sm font-medium text-slate-100">
                          {selectedRequest.trip_slug || "custom"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-400">Region:</span>
                        <span className="text-sm font-medium text-slate-100">
                          {selectedRequest.preferred_region || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-400">Date:</span>
                        <span className="text-sm font-medium text-slate-100 text-right">
                          {formatDate(selectedRequest.preferred_start_date)} · {selectedRequest.date_flexibility}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-400">Duration:</span>
                        <span className="text-sm font-medium text-slate-100">
                          {selectedRequest.duration_days} day{selectedRequest.duration_days !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-400">Group:</span>
                        <span className="text-sm font-medium text-slate-100 text-right">
                          {selectedRequest.adults} adult{selectedRequest.adults !== 1 ? "s" : ""}
                          {selectedRequest.children
                            ? `, ${selectedRequest.children} child${selectedRequest.children !== 1 ? "ren" : ""}`
                            : ""}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-400">Private trip:</span>
                        <span className="text-sm font-medium text-slate-100">
                          {selectedRequest.private_trip ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-400">Source:</span>
                        <span className="text-sm font-medium text-slate-100">{selectedRequest.source || "Unknown"}</span>
                      </div>
                    </div>
                  </section>

                  {/* Services & Preferences */}
                  <section className="space-y-4 rounded-xl border border-slate-700 bg-slate-800/30 p-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Services & preferences
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-400">Accommodation:</span>
                        <span className="text-sm font-medium text-slate-100">{selectedRequest.accommodation}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-400">Transport:</span>
                        <span className="text-sm font-medium text-slate-100">
                          {selectedRequest.transport || "Any"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-400">Guide:</span>
                        <span className="text-sm font-medium text-slate-100">
                          {selectedRequest.guide_required ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-400">Porter:</span>
                        <span className="text-sm font-medium text-slate-100">
                          {selectedRequest.porter_preference}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-slate-400">Add-ons:</span>
                        <span className="text-sm font-medium text-slate-100">
                          {selectedRequest.add_ons?.length ? selectedRequest.add_ons.join(", ") : "None"}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Contact & Context */}
                  <section className="space-y-4 rounded-xl border border-slate-700 bg-slate-800/30 p-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Contact & context</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-400">Name:</span>
                        <span className="text-sm font-medium text-slate-100">{selectedRequest.contact_name}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-400">Email:</span>
                        <span className="text-sm font-medium text-slate-100 truncate" title={selectedRequest.contact_email}>
                          {selectedRequest.contact_email}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-400">Phone:</span>
                        <span className="text-sm font-medium text-slate-100">{selectedRequest.contact_phone}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-400">Country:</span>
                        <span className="text-sm font-medium text-slate-100">{selectedRequest.contact_country}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-400">Fitness:</span>
                        <span className="text-sm font-medium text-slate-100">
                          {selectedRequest.fitness_level || "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-400">Budget:</span>
                        <span className="text-sm font-medium text-slate-100">
                          {selectedRequest.budget || "Flexible"}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Notes */}
                  {selectedRequest.special_requests && (
                    <section className="space-y-3 rounded-xl border border-slate-700 bg-slate-800/30 p-6">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Special requests</h4>
                      <p className="text-sm leading-relaxed text-slate-300">{selectedRequest.special_requests}</p>
                    </section>
                  )}

                  {/* Metadata */}
                  <section className="space-y-3 rounded-xl border border-slate-700 bg-slate-800/30 p-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Metadata</h4>
                    <div className="grid gap-3 text-xs">
                      <div>
                        <dt className="mb-1 font-medium uppercase tracking-wider text-slate-500">Created</dt>
                        <dd className="text-slate-300">{formatTimestamp(selectedRequest.created_at)}</dd>
                      </div>
                      <div>
                        <dt className="mb-1 font-medium uppercase tracking-wider text-slate-500">Updated</dt>
                        <dd className="text-slate-300">{formatTimestamp(selectedRequest.updated_at)}</dd>
                      </div>
                    </div>
                  </section>

                  {/* Status Dropdown */}
                  <div className="space-y-3">
                    <label htmlFor="status-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Update status
                    </label>
                    <select
                      id="status-select"
                      value={selectedRequest.status}
                      onChange={(e) =>
                        statusMutation.mutate({
                          requestRef: selectedRequest.request_ref,
                          status: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-100 shadow-sm transition-colors focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={statusMutation.isLoading}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    {statusMutation.isLoading && (
                      <p className="flex items-center gap-2 text-xs text-slate-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Saving status…
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <div className="rounded-full bg-slate-800 p-4">
                    <ListChecks size={32} className="text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-400">No request selected</p>
                  <p className="text-xs text-slate-500">Click a request to review details</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
