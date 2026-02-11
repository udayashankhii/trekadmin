// src/pages/model/TrekSelector.jsx
import React from "react";
import { ChevronDown, Search } from "lucide-react";

const TrekSelector = ({ treks, selectedTrek, onSelectTrek, loading }) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const filteredTreks = React.useMemo(() => {
    if (!searchTerm) return treks;
    const term = searchTerm.toLowerCase();
    return treks.filter(
      trek =>
        trek.name.toLowerCase().includes(term) ||
        trek.slug.toLowerCase().includes(term) ||
        trek.region?.toLowerCase().includes(term)
    );
  }, [treks, searchTerm]);

  const handleSelect = (trek) => {
    onSelectTrek(trek);
    setIsOpen(false);
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Trek
        </label>
        <div className="h-12 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Trek <span className="text-red-500">*</span>
      </label>

      {/* Selected Trek Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {selectedTrek ? (
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedTrek.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {selectedTrek.slug} {selectedTrek.region && `• ${selectedTrek.region}`}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Select a trek...</p>
            )}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search treks..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Trek List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredTreks.length > 0 ? (
                <div className="py-1">
                  {filteredTreks.map((trek) => (
                    <button
                      key={trek.id || trek.slug}
                      type="button"
                      onClick={() => handleSelect(trek)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        selectedTrek?.slug === trek.slug
                          ? "bg-blue-50 border-l-4 border-blue-600"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {trek.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                              {trek.slug}
                            </span>
                            {trek.region && (
                              <span className="text-xs text-gray-500">
                                • {trek.region}
                              </span>
                            )}
                          </div>
                          {trek.difficulty && (
                            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              {trek.difficulty}
                            </span>
                          )}
                        </div>
                        {selectedTrek?.slug === trek.slug && (
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  <p className="text-sm">No treks found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredTreks.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Showing {filteredTreks.length} of {treks.length} trek(s)
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TrekSelector;