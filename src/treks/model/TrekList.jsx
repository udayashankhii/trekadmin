import React, { useState, useEffect, useMemo } from "react";
import { Plus, RefreshCw } from "lucide-react";
import SearchBar from "../shared/SearchBar";
import TrekTable from "./TrekTable";

const TrekList = ({
  treks,
  loading,
  onRefresh,
  onAddTrek,
  onView,
  onEdit,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // ⭐ Memoize filtered treks to prevent unnecessary re-renders
  const filteredTreks = useMemo(() => {
    if (!searchQuery.trim()) {
      return treks;
    }

    const query = searchQuery.toLowerCase();
    return treks.filter((trek) => {
      // Safe field access with fallbacks
      const name = (trek.name || trek.title || "").toLowerCase();
      const slug = (trek.slug || trek.public_id || "").toLowerCase();
      const region = (trek.region || trek.region_name || "").toLowerCase();
      const difficulty = (trek.difficulty || trek.trip_grade || trek.trek_grade || "").toLowerCase();
      const description = (trek.description || trek.short_description || "").toLowerCase();

      return (
        name.includes(query) ||
        slug.includes(query) ||
        region.includes(query) ||
        difficulty.includes(query) ||
        description.includes(query)
      );
    });
  }, [searchQuery, treks]);

  // ⭐ Clear search when treks change significantly (e.g., after delete)
  useEffect(() => {
    if (treks.length === 0 && searchQuery) {
      setSearchQuery("");
    }
  }, [treks.length]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search treks by name, region, difficulty..."
            className="w-full sm:w-96"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Refresh trek list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onAddTrek}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Add new treks"
          >
            <Plus className="w-4 h-4" /> 
            <span>Add Trek{filteredTreks.length !== 1 ? 's' : ''}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <TrekTable
        treks={filteredTreks}
        loading={loading}
        searchQuery={searchQuery}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddTrek={onAddTrek}
      />

      {/* Results Summary */}
      {!loading && treks.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 border-t pt-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              Showing {filteredTreks.length} of {treks.length} trek{treks.length !== 1 ? 's' : ''}
            </span>
            {searchQuery && filteredTreks.length === 0 && (
              <span className="text-amber-600">
                • No results found
              </span>
            )}
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-blue-600 hover:underline font-medium transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Empty State - No Treks */}
      {!loading && treks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Treks Found
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by uploading your first trek data.
          </p>
          <button
            onClick={onAddTrek}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Upload Treks
          </button>
        </div>
      )}
    </div>
  );
};

export default TrekList;
