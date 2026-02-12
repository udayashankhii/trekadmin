// src/gallery/ImagePreviewer.jsx
/**
 * ImagePreview Component
 * 
 * Displays a preview of an uploaded image with remove functionality.
 * Supports showing file size and different object-fit modes.
 */

import React from "react";
import { X } from "lucide-react";

const ImagePreview = ({
  image,
  preview,
  onRemove,
  disabled = false,
  showSize = false,
  objectFit = "cover",
  className = "",
}) => {
  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={`relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 ${className}`}>
      {/* Image */}
      <div className="aspect-video w-full">
        <img
          src={preview}
          alt={image?.name || "Preview"}
          className={`w-full h-full object-${objectFit}`}
        />
      </div>

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />

      {/* Remove Button */}
      {onRemove && !disabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
          title="Remove image"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* File info bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <p className="text-xs text-white truncate font-medium">
          {image?.name || "Unknown"}
        </p>
        {showSize && image?.size && (
          <p className="text-xs text-white/80">
            {formatFileSize(image.size)}
          </p>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;