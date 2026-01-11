import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

const BlogUploadResults = ({ results, onClear, onViewList }) => {
  const successCount = results.filter((r) => r.success).length;
  const failCount = results.length - successCount;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Upload Results</h3>
        <button
          onClick={onClear}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Clear Results
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {results.map((result, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 p-3 rounded-lg ${
              result.success ? "bg-green-50" : "bg-red-50"
            }`}
          >
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <p
                className={`font-medium ${
                  result.success ? "text-green-900" : "text-red-900"
                }`}
              >
                {result.post || `Post ${i + 1}`}
              </p>

              {!result.success && result.message && (
                <p className="text-sm text-red-700 mt-1 break-words">
                  {result.message}
                </p>
              )}

              {result.success && result.message && (
                <p className="text-sm text-green-700 mt-1">{result.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <div className="text-sm">
          <span className="text-green-600 font-medium">
            {successCount} successful
          </span>
          <span className="text-gray-500 mx-2">•</span>
          <span className="text-red-600 font-medium">{failCount} failed</span>
        </div>

        <button
          onClick={onViewList}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          View Blog List
        </button>
      </div>
    </div>
  );
};

export default BlogUploadResults;
