// src/pages/model/TourBulkUpload.jsx
import React, { useRef, useState } from "react";
import { Upload, AlertCircle, CheckCircle, XCircle } from "lucide-react";

const TourBulkUpload = ({
  uploading,
  uploadProgress,
  uploadResults,
  onUpload,
  onClearResults,
  onViewList,
  showToast,
}) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;

    if (file.type !== "application/json") {
      showToast("Please upload a JSON file", "error");
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await onUpload(data);
    } catch (err) {
      showToast(
        `Failed to parse JSON: ${err.message}`,
        "error"
      );
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="border-b p-6">
        <h2 className="text-lg font-semibold text-gray-900">Bulk Upload Tours</h2>
        <p className="text-gray-600 text-sm mt-1">
          Upload a JSON file containing tour data. Format: {`{ "tours": [...] }`}
        </p>
      </div>

      <div className="p-6">
        {/* File Upload Area */}
        {!uploadResults || uploadResults.length === 0 ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={(e) => handleFile(e.target.files?.[0])}
              disabled={uploading}
              className="hidden"
            />

            <Upload
              size={32}
              className="mx-auto text-gray-400 mb-4"
            />
            <p className="text-gray-900 font-medium mb-2">
              Drag and drop your JSON file here
            </p>
            <p className="text-gray-600 text-sm mb-4">or</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Select File
            </button>

            {uploading && (
              <div className="mt-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                  <p className="text-gray-600">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Results */}
        {uploadResults && uploadResults.length > 0 && (
          <div className="mt-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Upload Summary
              </h3>

              {uploadResults.map((result, idx) => (
                <div key={idx} className="mb-3 last:mb-0">
                  {result.ok ? (
                    <div className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Success: {result.stats?.tours_created || 0} created,{" "}
                          {result.stats?.tours_updated || 0} updated
                        </p>
                        {result.warnings && result.warnings.length > 0 && (
                          <p className="text-yellow-700 text-sm mt-1">
                            ⚠️ {result.warnings.length} warning(s)
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <XCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Failed: {result.errors?.length || 0} error(s)
                        </p>
                        {result.errors && result.errors.length > 0 && (
                          <ul className="text-red-700 text-sm mt-2 space-y-1">
                            {result.errors.slice(0, 3).map((err, i) => (
                              <li key={i}>
                                • {err.error}
                                {err.slug && ` (${err.slug})`}
                              </li>
                            ))}
                            {result.errors.length > 3 && (
                              <li>• +{result.errors.length - 3} more error(s)</li>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onViewList}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                View List
              </button>
              <button
                onClick={onClearResults}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
              >
                Upload Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourBulkUpload;