// src/pages/model/ImageUploader.jsx
import React, { useRef, useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

const ImageUploader = ({ 
  type, 
  onFileSelect, 
  multiple = false, 
  disabled = false,
  maxFiles = 1 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      const filesToProcess = multiple 
        ? imageFiles.slice(0, maxFiles)
        : [imageFiles[0]];
      onFileSelect(filesToProcess);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(Array.from(files));
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-all duration-200
        ${disabled 
          ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60' 
          : isDragging
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-3">
        {/* Icon */}
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center
          ${isDragging 
            ? 'bg-blue-100' 
            : type === 'hero' 
              ? 'bg-blue-50' 
              : 'bg-green-50'
          }
        `}>
          {isDragging ? (
            <Upload className="w-6 h-6 text-blue-600" />
          ) : (
            <ImageIcon className={`w-6 h-6 ${
              type === 'hero' ? 'text-blue-600' : 'text-green-600'
            }`} />
          )}
        </div>

        {/* Text */}
        <div>
          <p className="text-sm font-medium text-gray-900">
            {isDragging ? (
              "Drop images here"
            ) : (
              <>
                <span className={`${
                  type === 'hero' ? 'text-blue-600' : 'text-green-600'
                } font-semibold`}>
                  Click to upload
                </span>
                {" or drag and drop"}
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {multiple 
              ? `PNG, JPG, WEBP up to 5MB each (max ${maxFiles} images)`
              : "PNG, JPG, WEBP up to 5MB"
            }
          </p>
        </div>

        {/* Additional Info */}
        {type === 'hero' && (
          <div className="mt-2 px-3 py-1.5 bg-blue-50 rounded-full">
            <p className="text-xs text-blue-700 font-medium">
              Recommended: 1920 x 1080px
            </p>
          </div>
        )}

        {type === 'gallery' && (
          <div className="mt-2 px-3 py-1.5 bg-green-50 rounded-full">
            <p className="text-xs text-green-700 font-medium">
              Recommended: 1200 x 800px
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;