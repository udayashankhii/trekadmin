// src/pages/model/TourDetailModal.jsx
import React from "react";
import { X } from "lucide-react";

const TourDetailModal = ({
  isOpen,
  onClose,
  tour,
  tourData,
  loading,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {tour?.title || "Tour Details"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-2">Loading tour details...</p>
              </div>
            ) : tourData ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">
                        {tourData.location || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-medium text-gray-900">
                        {tourData.duration || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Difficulty</p>
                      <p className="font-medium text-gray-900">
                        {tourData.difficulty || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Max Altitude</p>
                      <p className="font-medium text-gray-900">
                        {tourData.max_altitude || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {tourData.short_description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Description
                    </h4>
                    <p className="text-gray-700 text-sm line-clamp-3">
                      {tourData.short_description}
                    </p>
                  </div>
                )}

                {/* Highlights */}
                {tourData.highlights && tourData.highlights.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Highlights
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {tourData.highlights.slice(0, 5).map((h, i) => (
                        <li key={i}>
                          • {typeof h === "string" ? h : h.text}
                        </li>
                      ))}
                      {tourData.highlights.length > 5 && (
                        <li>
                          • +{tourData.highlights.length - 5} more highlights
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Itinerary */}
                {tourData.itinerary_days && tourData.itinerary_days.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Itinerary ({tourData.itinerary_days.length} days)
                    </h4>
                    <div className="space-y-2">
                      {tourData.itinerary_days.slice(0, 3).map((day) => (
                        <div key={day.id} className="bg-gray-50 p-3 rounded text-sm">
                          <p className="font-medium text-gray-900">
                            Day {day.day}: {day.title}
                          </p>
                          {day.description && (
                            <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                              {day.description}
                            </p>
                          )}
                        </div>
                      ))}
                      {tourData.itinerary_days.length > 3 && (
                        <p className="text-gray-600 text-sm">
                          +{tourData.itinerary_days.length - 3} more days
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Pricing */}
                {tourData.group_prices && tourData.group_prices.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Group Pricing
                    </h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left text-gray-600 font-medium py-2">
                            Group Size
                          </th>
                          <th className="text-right text-gray-600 font-medium py-2">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tourData.group_prices.slice(0, 5).map((gp) => (
                          <tr key={gp.id} className="border-b">
                            <td className="text-gray-900 py-2">
                              {gp.label}
                            </td>
                            <td className="text-right text-gray-900 font-medium">
                              ₨{(gp.price || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Gallery */}
                {tourData.gallery_images && tourData.gallery_images.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Gallery ({tourData.gallery_images.length} images)
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {tourData.gallery_images.slice(0, 3).map((img) => (
                        <div key={img.id} className="bg-gray-100 rounded overflow-hidden">
                          <img
                            src={img.image_url}
                            alt={img.caption || "Tour image"}
                            className="w-full h-24 object-cover"
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SEO */}
                {tourData.seo && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      SEO Information
                    </h4>
                    <div className="text-sm space-y-1">
                      <div>
                        <p className="text-gray-600">Meta Title</p>
                        <p className="text-gray-900 truncate">
                          {tourData.seo.meta_title || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Meta Description</p>
                        <p className="text-gray-900 text-xs line-clamp-2">
                          {tourData.seo.meta_description || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailModal;