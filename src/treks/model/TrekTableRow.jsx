import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";

const TrekTableRow = ({ trek, onView, onEdit, onDelete }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div>
          <div className="font-medium text-gray-900">{trek.name}</div>
          <div className="text-sm text-gray-500">{trek.slug}</div>
          {trek.rating !== "N/A" && (
            <div className="text-xs text-gray-400 mt-1">⭐ {trek.rating}</div>
          )}
        </div>
      </td>

      <td className="px-6 py-4 text-gray-900">{trek.region}</td>

      <td className="px-6 py-4">
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
          {trek.difficulty}
        </span>
      </td>

      <td className="px-6 py-4 text-gray-900">{trek.duration}</td>

      <td className="px-6 py-4 text-gray-900 font-medium">{trek.price}</td>

      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            trek.status === "Published"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {trek.status}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView && onView(trek)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit && onEdit(trek)}
            className="text-green-600 hover:text-green-800 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete && onDelete(trek)}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TrekTableRow;
