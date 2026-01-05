import React from "react";
import LoadingSpinner from "../shared/LoadingSpinner";

const UploadProgress = ({ current, total }) => {
  const percentage = total === 0 ? 0 : (current / total) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-3">
        <LoadingSpinner size="sm" />
        <span className="font-medium">
          Uploading treks... {current} of {total}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-sm text-gray-600 mt-2">
        Please wait while your treks are being uploaded...
      </p>
    </div>
  );
};

export default UploadProgress;
