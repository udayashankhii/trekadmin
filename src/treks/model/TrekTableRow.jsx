// src/treks/model/TrekTableRow.jsx
import React from "react";
import { Eye, Edit, Trash2, ExternalLink } from "lucide-react";

// Status badge color mapping
const STATUS_STYLES = {
  Published: "bg-green-100 text-green-800",
  Draft: "bg-gray-100 text-gray-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Archived: "bg-red-100 text-red-800",
};

// Difficulty badge color mapping
const DIFFICULTY_STYLES = {
  Easy: "bg-green-100 text-green-800",
  Moderate: "bg-yellow-100 text-yellow-800",
  Challenging: "bg-orange-100 text-orange-800",
  Difficult: "bg-red-100 text-red-800",
  Strenuous: "bg-red-200 text-red-900",
};

/**
 * TrekTableRow Component
 * Displays a single trek row with all details and action buttons
 */
const TrekTableRow = ({ trek, onView, onEdit, onDelete }) => {
  // Guard clause
  if (!trek) return null;

  // Destructure trek properties with fallbacks
  const {
    name,
    title,
    slug,
    rating,
    region,
    region_name,
    difficulty,
    trip_grade,
    duration,
    price,
    status,
  } = trek;

  // Determine final values with fallbacks
  const displayName = name || title || "Untitled Trek";
  const displayRegion = region || region_name || "—";
  const displayDifficulty = difficulty || trip_grade || "N/A";
  const displayDuration = duration || "N/A";
  const displayPrice = price || "N/A";
  const displayStatus = status || "Published";
  const displayRating = rating || 0;

  // Get badge styles
  const statusClass = STATUS_STYLES[displayStatus] || "bg-gray-100 text-gray-800";
  const difficultyClass = DIFFICULTY_STYLES[displayDifficulty] || "bg-gray-100 text-gray-800";

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Trek Info Column */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          {/* Trek Name */}
          <div className="font-medium text-gray-900 line-clamp-1">
            {displayName}
          </div>
          
          {/* ✅ Clickable Trek Slug - Navigate to Edit Page */}
          {slug && (
            <button
              onClick={() => onEdit?.(trek)}
              className="group flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-mono transition-colors"
              title="Click to edit trek"
            >
              <span className="group-hover:underline">{slug}</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
          
          {/* Trek Rating */}
          {displayRating > 0 && displayRating !== "N/A" && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <span>⭐</span>
              <span className="font-medium">{displayRating}</span>
            </div>
          )}
        </div>
      </td>

      {/* Region Column */}
      <td className="px-6 py-4">
        <span className="text-sm text-gray-900">
          {displayRegion}
        </span>
      </td>

      {/* Difficulty Column */}
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyClass}`}>
          {displayDifficulty}
        </span>
      </td>

      {/* Duration Column */}
      <td className="px-6 py-4">
        <span className="text-sm text-gray-900">
          {displayDuration}
        </span>
      </td>

      {/* Price Column */}
      <td className="px-6 py-4">
        <span className={`text-sm font-semibold ${
          displayPrice === "Loading..." 
            ? "text-gray-400" 
            : displayPrice === "N/A"
            ? "text-gray-500"
            : "text-gray-900"
        }`}>
          {displayPrice}
        </span>
      </td>

      {/* Status Column */}
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
          {displayStatus}
        </span>
      </td>

      {/* Actions Column */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          <ActionButton
            label="View trek details"
            color="text-blue-600 hover:bg-blue-50"
            onClick={() => onView?.(trek)}
            icon={<Eye className="w-4 h-4" />}
          />
          <ActionButton
            label="Edit trek"
            color="text-green-600 hover:bg-green-50"
            onClick={() => onEdit?.(trek)}
            icon={<Edit className="w-4 h-4" />}
          />
          <ActionButton
            label="Delete trek"
            color="text-red-600 hover:bg-red-50"
            onClick={() => onDelete?.(trek)}
            icon={<Trash2 className="w-4 h-4" />}
          />
        </div>
      </td>
    </tr>
  );
};

/**
 * ActionButton Component
 * Reusable action button with icon
 */
const ActionButton = ({ label, icon, color, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    aria-label={label}
    className={`p-2 ${color} rounded-lg transition-all duration-200`}
  >
    {icon}
  </button>
);

export default TrekTableRow;
