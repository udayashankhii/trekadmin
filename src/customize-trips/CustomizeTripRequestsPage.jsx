import { Loader2, RefreshCw, ListChecks } from "lucide-react";
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
      return "bg-slate-900/60 text-slate-100 border-slate-500";
    case "in_review":
      return "bg-amber-900/60 text-amber-100 border-amber-500";
    case "quote_sent":
      return "bg-indigo-900/60 text-indigo-100 border-indigo-500";
    case "confirmed":
      return "bg-emerald-900/60 text-emerald-100 border-emerald-500";
    case "closed":
      return "bg-rose-900/60 text-rose-100 border-rose-500";
    default:
      return "bg-slate-900/60 text-slate-100 border-slate-500";
  }
};

const formatDate = (value) => {
  if (!value) {
    return "TBD";
  }
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
  if (!value) {
    return "—";
  }
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export default function CustomizeTripRequestsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRef, setSelectedRef] = useState(null);
  const debouncedSearch = useDebouncedValue(search, 500);
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
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
    if (!selectedRef && requests.length) {
      setSelectedRef(requests[0].request_ref);
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
    <div className="page-section space-y-6">
      <header className="page-section__header">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <ListChecks size={14} />
            Customize trip requests
          </p>
          <h2>Tailored trek enquiries</h2>
          <p className="subtle">
            Track bespoke requests, review contact details, and move each request through status updates.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="button button--primary inline-flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      <div className="search-row">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <input
            type="search"
            placeholder="Search by trek, name, email, or request ID"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <select
            className="rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
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
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Trip</th>
                <th>Date</th>
                <th>Group</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-slate-400">
                    <Loader2 className="inline-block h-4 w-4 animate-spin" />
                    <span className="ml-2">Loading requests …</span>
                  </td>
                </tr>
              )}
              {!isLoading && requests.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-slate-400">
                    No requests match your filters.
                  </td>
                </tr>
              )}
              {!isLoading &&
                requests.map((request) => (
                  <tr
                    key={request.request_ref}
                    className={`cursor-pointer transition hover:bg-slate-800 ${
                      selectedRef === request.request_ref ? "bg-slate-900" : ""
                    }`}
                    onClick={() => setSelectedRef(request.request_ref)}
                  >
                    <td>
                      <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        {request.request_ref}
                      </div>
                      <strong className="text-sm text-slate-100">{request.contact_name}</strong>
                      <p className="text-xs text-slate-500">{request.contact_email}</p>
                    </td>
                    <td>
                      <div className="text-sm text-slate-100">{request.trip_name || "Unknown trek"}</div>
                      <p className="text-xs text-slate-500">{request.trip_slug || "Custom"}</p>
                    </td>
                    <td>{formatDate(request.preferred_start_date)}</td>
                    <td>
                      {request.adults} adults{request.children ? ` · ${request.children} children` : ""}
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                          request.status,
                        )}`}
                      >
                        {STATUS_OPTIONS.find((option) => option.value === request.status)?.label ||
                          "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-400">
            <span>
              Showing {requests.length} of {totalCount} requests
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="rounded-full border border-slate-800 px-3 py-1"
                disabled={page <= 1}
              >
                Previous
              </button>
              <span>
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="rounded-full border border-slate-800 px-3 py-1"
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <aside className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Selected request</p>
              <h3 className="text-lg text-slate-100">
                {selectedRequest?.trip_name || "No selection"}
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {selectedRequest?.request_ref ?? "—"}
            </span>
          </div>

          {detailQuery.isFetching && !selectedRequest ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading request detail…
            </div>
          ) : selectedRequest ? (
            <div className="space-y-4 text-sm text-slate-200">
              <section className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Trip basics</p>
                <div className="grid gap-2 md:grid-cols-2">
                  <p>
                    <span className="text-slate-400">Trek:</span> {selectedRequest.trip_name || "Custom"}
                  </p>
                  <p>
                    <span className="text-slate-400">Slug:</span> {selectedRequest.trip_slug || "custom"}
                  </p>
                  <p>
                    <span className="text-slate-400">Region:</span> {selectedRequest.preferred_region || "N/A"}
                  </p>
                  <p>
                    <span className="text-slate-400">Date:</span> {formatDate(selectedRequest.preferred_start_date)} ·{" "}
                    {selectedRequest.date_flexibility}
                  </p>
                  <p>
                    <span className="text-slate-400">Duration:</span> {selectedRequest.duration_days} day{selectedRequest.duration_days !== 1 ? "s" : ""}
                  </p>
                  <p>
                    <span className="text-slate-400">Group:</span> {selectedRequest.adults} adult{selectedRequest.adults !== 1 ? "s" : ""}{selectedRequest.children ? `, ${selectedRequest.children} child${selectedRequest.children !== 1 ? "ren" : ""}` : ""}
                  </p>
                  <p>
                    <span className="text-slate-400">Private trip:</span> {selectedRequest.private_trip ? "Yes" : "No"}
                  </p>
                  <p>
                    <span className="text-slate-400">Source:</span> {selectedRequest.source || "Unknown"}
                  </p>
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Services & preferences</p>
                <div className="grid gap-2 md:grid-cols-2">
                  <p>
                    <span className="text-slate-400">Accommodation:</span> {selectedRequest.accommodation}
                  </p>
                  <p>
                    <span className="text-slate-400">Transport:</span> {selectedRequest.transport || "Any"}
                  </p>
                  <p>
                    <span className="text-slate-400">Guide:</span> {selectedRequest.guide_required ? "Yes" : "No"}
                  </p>
                  <p>
                    <span className="text-slate-400">Porter:</span> {selectedRequest.porter_preference}
                  </p>
                  <p className="md:col-span-2">
                    <span className="text-slate-400">Add-ons:</span>{" "}
                    {selectedRequest.add_ons?.length ? selectedRequest.add_ons.join(", ") : "None"}
                  </p>
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Contact & context</p>
                <div className="grid gap-2 md:grid-cols-2">
                  <p>
                    <span className="text-slate-400">Name:</span> {selectedRequest.contact_name}
                  </p>
                  <p>
                    <span className="text-slate-400">Email:</span> {selectedRequest.contact_email}
                  </p>
                  <p>
                    <span className="text-slate-400">Phone:</span> {selectedRequest.contact_phone}
                  </p>
                  <p>
                    <span className="text-slate-400">Country:</span> {selectedRequest.contact_country}
                  </p>
                  <p>
                    <span className="text-slate-400">Fitness:</span> {selectedRequest.fitness_level || "Not specified"}
                  </p>
                  <p>
                    <span className="text-slate-400">Budget:</span> {selectedRequest.budget || "Flexible"}
                  </p>
                  <p>
                    <span className="text-slate-400">Consent:</span> {selectedRequest.consent_to_contact ? "Yes" : "No"}
                  </p>
                  <p>
                    <span className="text-slate-400">Origin URL:</span> {selectedRequest.origin_url || "Unknown"}
                  </p>
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Notes & metadata</p>
                <p className="text-sm text-slate-300">
                  {selectedRequest.special_requests || "No special requests."}
                </p>
                <dl className="grid gap-2 text-xs text-slate-400 md:grid-cols-2">
                  <div>
                    <dt className="uppercase tracking-[0.4em]">Created</dt>
                    <dd className="text-slate-200">{formatTimestamp(selectedRequest.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-[0.4em]">Updated</dt>
                    <dd className="text-slate-200">{formatTimestamp(selectedRequest.updated_at)}</dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="uppercase tracking-[0.4em]">Metadata</dt>
                    <dd className="text-slate-200">
                      {selectedRequest.metadata && Object.keys(selectedRequest.metadata).length
                        ? JSON.stringify(selectedRequest.metadata)
                        : "None"}
                    </dd>
                  </div>
                </dl>
              </section>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Status</label>
                <select
                  value={selectedRequest.status}
                  onChange={(event) =>
                    statusMutation.mutate({
                      requestRef: selectedRequest.request_ref,
                      status: event.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none"
                  disabled={statusMutation.isLoading}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                {statusMutation.isLoading && (
                  <p className="text-xs text-slate-400">Saving status…</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Click a request to review every detail.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
