// src/tours/TourDetailModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Copy,
  ExternalLink,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import JsonView from '@uiw/react-json-view';
import { darkTheme } from '@uiw/react-json-view/dark';
import { lightTheme } from '@uiw/react-json-view/light';

const TourDetailModal = ({
  isOpen,
  onClose,
  tour,
  tourData,
  loading,
  error
}) => {
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState('light');

  // Reset copied state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyJSON = () => {
    if (tourData) {
      navigator.clipboard.writeText(
        JSON.stringify(tourData, null, 2)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadJSON = () => {
    if (!tourData) return;

    const blob = new Blob(
      [JSON.stringify(tourData, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tour.slug || 'tour'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {tour.title || 'Tour Details'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Slug: <span className="font-mono text-blue-600">{tour.slug}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopyJSON}
              disabled={loading || error}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Copy JSON"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm font-medium">Copy</span>
                </>
              )}
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownloadJSON}
              disabled={loading || error}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download JSON"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading tour data...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center max-w-md">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Failed to Load Tour Data
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {!loading && !error && tourData && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <JsonView
                value={tourData}
                style={theme === 'dark' ? darkTheme : lightTheme}
                displayDataTypes={true}
                displayObjectSize={true}
                enableClipboard={true}
                collapsed={2}
              />
            </div>
          )}

          {!loading && !error && !tourData && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && tourData && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Tour ID:</span>{' '}
                <span className="font-mono">{tourData.id || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {tourData.created_at
                  ? new Date(tourData.created_at).toLocaleDateString()
                  : 'N/A'
                }
              </div>
              <div>
                <span className="font-medium">Updated:</span>{' '}
                {tourData.updated_at
                  ? new Date(tourData.updated_at).toLocaleDateString()
                  : 'N/A'
                }
              </div>
            </div>

            {tourData.slug && (
              <a
                href={`http://127.0.0.1:8000/api/admin/tours/import/full/${tourData.slug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View in API
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TourDetailModal;