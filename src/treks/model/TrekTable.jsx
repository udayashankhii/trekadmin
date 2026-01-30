import React from "react";
import { AlertCircle } from "lucide-react";
import TrekTableRow from "./TrekTableRow";

const TrekTable = ({
  treks,
  loading,
  searchQuery,
  onView,
  onEdit,
  onDelete,
  onAddTrek,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-600 border-t-transparent" />
        <p className="mt-4 text-gray-600">Loading treks...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trek Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y bg-white">
          {treks.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchQuery ? "No treks found" : "No treks uploaded yet"}
                </p>
                {!searchQuery && (
                  <button
                    onClick={onAddTrek}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Upload Your First Trek
                  </button>
                )}
              </td>
            </tr>
          ) : (
            treks.map((trek) => (
              <TrekTableRow
                key={trek.slug}
                trek={trek}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TrekTable;
