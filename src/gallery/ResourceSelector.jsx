// src/gallery/ResourceSelector.jsx
/**
 * ResourceSelector Component
 * 
 * A universal production-grade dropdown selector for treks/tours with search functionality.
 * Features:
 * - Support for both treks and tours
 * - Search/filter by name, slug, region/location
 * - Keyboard navigation support
 * - Loading and error states
 * - Accessibility (ARIA labels, keyboard support)
 * - Null-safe operations
 * - Production-ready error handling
 * - Handles nested object properties safely
 */

import React, { useMemo, useState, useRef, useEffect } from "react";
import { ChevronDown, Search, AlertCircle } from "lucide-react";
import PropTypes from "prop-types";

// Helper function to safely extract string value from potentially nested objects
const getStringValue = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    // Handle nested objects (e.g., {id: 1, name: "Trek Name", slug: "trek-slug"})
    return value.name || value.title || value.slug || value.value || '';
  }
  return String(value);
};

const ResourceSelector = ({ 
  type = 'treks',
  items = [], 
  selectedItem = null, 
  onSelectItem, 
  loading = false,
  error = null,
  placeholder,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const buttonRef = useRef(null);

  // Determine resource name
  const resourceName = useMemo(() => {
    return type === 'tours' ? 'Tour' : 'Trek';
  }, [type]);

  // Default placeholder
  const defaultPlaceholder = useMemo(() => {
    return placeholder || `Select a ${resourceName.toLowerCase()}...`;
  }, [placeholder, resourceName]);

  // Validate and sanitize items array
  const safeItems = useMemo(() => {
    if (!Array.isArray(items)) {
      console.warn(`ResourceSelector: 'items' prop should be an array, received:`, typeof items);
      return [];
    }
    
    // Filter out invalid entries and normalize string values
    return items.filter(item => {
      if (!item || typeof item !== 'object') return false;
      if (!item.slug && !getStringValue(item.slug)) {
        console.warn(`ResourceSelector: ${resourceName} missing required 'slug' field:`, item);
        return false;
      }
      return true;
    }).map(item => ({
      ...item,
      // Ensure all displayed values are strings
      name: getStringValue(item.name),
      title: getStringValue(item.title),
      slug: getStringValue(item.slug),
      region: getStringValue(item.region),
      location: getStringValue(item.location),
      difficulty: getStringValue(item.difficulty),
      travel_style: getStringValue(item.travel_style),
    }));
  }, [items, resourceName]);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === "") {
      return safeItems;
    }

    const term = searchTerm.toLowerCase().trim();
    
    return safeItems.filter(item => {
      try {
        const name = (item.name || "").toLowerCase();
        const slug = (item.slug || "").toLowerCase();
        const info = (item.region || item.location || "").toLowerCase();
        
        return name.includes(term) || 
               slug.includes(term) || 
               info.includes(term);
      } catch (err) {
        console.error(`ResourceSelector: Error filtering ${resourceName}:`, item, err);
        return false;
      }
    });
  }, [safeItems, searchTerm, resourceName]);

  // Handle item selection
  const handleSelect = (item) => {
    if (!item || !onSelectItem) return;
    
    try {
      onSelectItem(item);
      setIsOpen(false);
      setSearchTerm("");
      setFocusedIndex(-1);
    } catch (err) {
      console.error(`ResourceSelector: Error in onSelectItem callback:`, err);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (disabled || loading) return;
    setIsOpen(prev => !prev);
  };

  // Close dropdown
  const closeDropdown = () => {
    setIsOpen(false);
    setSearchTerm("");
    setFocusedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredItems.length) {
          handleSelect(filteredItems[focusedIndex]);
        }
        break;
      
      case "Escape":
        e.preventDefault();
        closeDropdown();
        buttonRef.current?.focus();
        break;
      
      default:
        break;
    }
  };

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Loading state
  if (loading) {
    return (
      <div className="animate-pulse" role="status" aria-live="polite">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select {resourceName}
        </label>
        <div className="h-12 bg-gray-200 rounded-lg" aria-label={`Loading ${resourceName.toLowerCase()}s`} />
        <span className="sr-only">Loading {resourceName.toLowerCase()}s...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div role="alert" aria-live="assertive">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select {resourceName}
        </label>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">
                Failed to load {resourceName.toLowerCase()}s
              </p>
              <p className="text-sm text-red-700 mt-1">
                {typeof error === 'string' ? error : 'An unexpected error occurred'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (safeItems.length === 0) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select {resourceName}
        </label>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">
                No {resourceName.toLowerCase()}s available
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Please add {resourceName.toLowerCase()}s before uploading images.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get display values for selected item (safely)
  const selectedItemName = selectedItem ? (
    getStringValue(selectedItem.name) || 
    getStringValue(selectedItem.title) || 
    getStringValue(selectedItem.slug)
  ) : '';

  const selectedItemSlug = selectedItem ? getStringValue(selectedItem.slug) : '';
  const selectedItemInfo = selectedItem ? (
    getStringValue(selectedItem.region) || 
    getStringValue(selectedItem.location)
  ) : '';

  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      <label 
        htmlFor={`${type}-selector`} 
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Select {resourceName} <span className="text-red-500" aria-label="required">*</span>
      </label>

      {/* Selected Item Display Button */}
      <button
        ref={buttonRef}
        id={`${type}-selector`}
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={
          selectedItem 
            ? `Selected ${resourceName.toLowerCase()}: ${selectedItemName}` 
            : `Select a ${resourceName.toLowerCase()}`
        }
        className={`
          w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg
          transition-all duration-200
          ${disabled 
            ? 'bg-gray-100 cursor-not-allowed opacity-60' 
            : 'hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {selectedItem ? (
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedItemName}
                </p>
                {(selectedItemSlug || selectedItemInfo) && (
                  <p className="text-xs text-gray-500 truncate">
                    {selectedItemSlug}
                    {selectedItemInfo && ` • ${selectedItemInfo}`}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{defaultPlaceholder}</p>
            )}
          </div>
          <ChevronDown
            className={`
              w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2
              ${isOpen ? "transform rotate-180" : ""}
            `}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={closeDropdown}
            aria-hidden="true"
          />

          {/* Dropdown Content */}
          <div
            ref={dropdownRef}
            role="listbox"
            aria-label={`${resourceName} options`}
            className="absolute z-20 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden"
            style={{ maxHeight: "24rem" }}
          >
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" 
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setFocusedIndex(-1);
                  }}
                  placeholder={`Search ${resourceName.toLowerCase()}s...`}
                  aria-label={`Search ${resourceName.toLowerCase()}s`}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Item List */}
            <div 
              className="overflow-y-auto" 
              style={{ maxHeight: "20rem" }}
            >
              {filteredItems.length > 0 ? (
                <div className="py-1">
                  {filteredItems.map((item, index) => {
                    const isSelected = selectedItemSlug === item.slug;
                    const isFocused = index === focusedIndex;

                    // Safely get display values
                    const displayName = item.name || item.title || item.slug;
                    const displaySlug = item.slug;
                    const displayInfo = item.region || item.location;
                    const displayExtra = item.difficulty || item.travel_style;

                    return (
                      <button
                        key={item.id || item.slug || index}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setFocusedIndex(index)}
                        className={`
                          w-full px-4 py-3 text-left transition-colors
                          ${isSelected 
                            ? "bg-blue-50 border-l-4 border-blue-600" 
                            : isFocused
                              ? "bg-gray-100"
                              : "hover:bg-gray-50"
                          }
                        `}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {displayName}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {displaySlug && (
                                <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                                  {displaySlug}
                                </span>
                              )}
                              {displayInfo && (
                                <span className="text-xs text-gray-500">
                                  • {displayInfo}
                                </span>
                              )}
                            </div>
                            {displayExtra && (
                              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                {displayExtra}
                              </span>
                            )}
                          </div>
                          
                          {/* Selected Indicator */}
                          {isSelected && (
                            <div className="flex-shrink-0" aria-hidden="true">
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
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">No {resourceName.toLowerCase()}s found</p>
                  <p className="text-xs mt-1">
                    {searchTerm 
                      ? "Try a different search term" 
                      : `No ${resourceName.toLowerCase()}s available`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Footer with count */}
            {filteredItems.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Showing {filteredItems.length} of {safeItems.length} {resourceName.toLowerCase()}(s)
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// PropTypes for runtime validation
ResourceSelector.propTypes = {
  type: PropTypes.oneOf(['treks', 'tours']),
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      slug: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      name: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      region: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      location: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      difficulty: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      travel_style: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    })
  ),
  selectedItem: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    slug: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    name: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    region: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    location: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    difficulty: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    travel_style: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }),
  onSelectItem: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
};

export default ResourceSelector;