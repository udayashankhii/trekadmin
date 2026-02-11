// src/pages/model/ImagePreview.jsx
import React from "react";
import { X, File } from "lucide-react";

const ImagePreview = ({ image, preview, onRemove, disabled = false, showSize = false }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="relative group">
      {/* Image Container */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
        <img
          src={preview}
          alt={image.name}
          className="w-full h-full object-cover"
        />

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200">
          {/* Remove Button */}
          {!disabled && (
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Image Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <p className="text-white text-xs font-medium truncate">
              {image.name}
            </p>
          </div>
        </div>
      </div>

      {/* File Info */}
      {showSize && (
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
          <File className="w-3 h-3" />
          <span className="truncate flex-1">{image.name}</span>
          <span className="text-gray-500">{formatFileSize(image.size)}</span>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;