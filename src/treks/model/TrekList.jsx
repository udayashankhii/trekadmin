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

  const filteredTreks = useMemo(() => {
    if (!searchQuery.trim()) return treks;

    const query = searchQuery.toLowerCase();
    return treks.filter((trek) => {
      const name = (trek.name || trek.title || "").toLowerCase();
      const slug = (trek.slug || "").toLowerCase();
      const region = (trek.region || trek.region_name || "").toLowerCase();
      const difficulty = (
        trek.difficulty ||
        trek.trip_grade ||
        trek.trek_grade ||
        ""
      ).toLowerCase();
      const description = (
        trek.description ||
        trek.short_description ||
        ""
      ).toLowerCase();

      return (
        name.includes(query) ||
        slug.includes(query) ||
        region.includes(query) ||
        difficulty.includes(query) ||
        description.includes(query)
      );
    });
  }, [searchQuery, treks]);

  useEffect(() => {
    if (treks.length === 0 && searchQuery) {
      setSearchQuery("");
    }
  }, [treks.length]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search treks by name, region, difficulty..."
          className="w-full sm:w-96"
        />

        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={onAddTrek}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Trek
          </button>
        </div>
      </div>

      <TrekTable
        treks={filteredTreks}
        loading={loading}
        searchQuery={searchQuery}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddTrek={onAddTrek}
      />
    </div>
  );
};

export default TrekList;
