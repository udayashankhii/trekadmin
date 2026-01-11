// src/components/model/UploadResults.jsx
import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Eye, Trash2 } from 'lucide-react';

const UploadResults = ({ results, onClear, onViewList }) => {
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const totalCount = results.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Upload Results
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {totalCount} trek{totalCount !== 1 ? 's' : ''} processed
            </p>
          </div>
          
          {/* Summary Stats */}
          <div className="flex items-center gap-4">
            {successCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {successCount} successful
                </span>
              </div>
            )}
            
            {failCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 rounded-lg">
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {failCount} failed
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {results.map((result, index) => (
          <div
            key={index}
            className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
              result.success ? 'bg-white' : 'bg-red-50'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Status Icon */}
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}

              {/* Trek Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {result.trek}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Slug: <span className="font-mono">{result.slug}</span>
                </p>
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.message}
                </p>
                {result.action && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Action: {result.action}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear Results
        </button>

        {successCount > 0 && (
          <button
            onClick={onViewList}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Trek List
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadResults;
