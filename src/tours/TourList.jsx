// src/pages/model/TourList.jsx
import React from "react";
import { Trash2, Eye, Edit, Plus, RefreshCw, AlertCircle } from "lucide-react";

const TourList = ({
  tours,
  loading,
  onRefresh,
  onAddTour,
  onView,
  onEdit,
  onDelete,
}) => {
  if (loading && tours.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading tours...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="border-b p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Tours</h2>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={onAddTour}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={16} />
            Add Tour
          </button>
        </div>
      </div>

      {/* Table */}
      {tours.length === 0 ? (
        <div className="p-12 text-center">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">No tours found</p>
          <p className="text-gray-500 text-sm mt-2">
            Click "Add Tour" or "Bulk Upload" to get started
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Style
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tours.map((tour) => (
                <tr key={tour.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {tour.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {tour.location || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {tour.duration || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {tour.price ? `₨${tour.price.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {tour.travel_style || "General"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {tour.rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{tour.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">
                          ({tour.reviews_count})
                        </span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        tour.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {tour.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onView(tour)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(tour)}
                        className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                        title="Edit tour"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(tour)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Delete tour"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TourList;