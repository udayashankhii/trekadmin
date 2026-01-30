// src/pages/CloudinaryImport.jsx
import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, XCircle, AlertTriangle, FileJson } from 'lucide-react';
import { useCloudinaryImport } from '../hooks/cloud/useCloudinaryImport';
import { TOAST_TYPES } from '../components/utils/constants';
import { useToast } from '../hooks/useToast';

const CloudinaryImport = () => {
  const [jsonData, setJsonData] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const fileInputRef = useRef(null);

  const { importing, result, error, importImages, clearResults } = useCloudinaryImport();
  const { toast, showToast, hideToast } = useToast();
  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      setJsonData(JSON.stringify(parsed, null, 2));
      setFileInfo({
        name: file.name,
        size: (file.size / 1024).toFixed(2),
        treksCount: parsed.length
      });


    } catch (err) {

      event.target.value = '';
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!jsonData.trim()) {
      showToast?.('Please provide JSON data', TOAST_TYPES.ERROR);
      return;
    }

    showToast?.('Importing Cloudinary images...', TOAST_TYPES.INFO);
    const response = await importImages(jsonData);

    if (response.success) {
      const successCount = response.data.summary?.success || 0;
      showToast?.(
        `Successfully imported images for ${successCount} trek(s)`,
        TOAST_TYPES.SUCCESS
      );
    } else {
      showToast?.(
        `Import failed: ${response.error}`,
        TOAST_TYPES.ERROR
      );
    }
  };

  // Load example
  const loadExample = () => {
    const example = [
      {
        "trek_slug": "your-trek-slug-here",
        "cloudinary_images": {
          "hero_public_id": "treks/your-trek-slug/hero/image_id",
          "card_public_id": "treks/your-trek-slug/card/image_id",
          "gallery_public_ids": [
            "treks/your-trek-slug/gallery/image1_id",
            "treks/your-trek-slug/gallery/image2_id"
          ]
        }
      }
    ];

    setJsonData(JSON.stringify(example, null, 2));
    setFileInfo({ name: 'example.json', treksCount: 1 });
    showToast?.('Example loaded - replace trek_slug with your actual trek slug', TOAST_TYPES.INFO);
  };

  const clearAll = () => {
    setJsonData('');
    setFileInfo(null);
    clearResults();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Cloudinary Image Import
        </h1>
        <p className="text-gray-600">
          Import Cloudinary public IDs to link images with treks
        </p>
      </div>

      {/* File Upload Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upload JSON File</h2>
          <button
            onClick={loadExample}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Load Example
          </button>
        </div>

        <div className="flex gap-4">
          <label className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              disabled={importing}
              className="hidden"
            />
            <div className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg border-2 border-dashed border-blue-300 hover:bg-blue-100 cursor-pointer transition-colors">
              <FileJson className="w-5 h-5" />
              <span className="font-medium">Choose JSON File</span>
            </div>
          </label>

          {fileInfo && (
            <button
              onClick={clearAll}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          )}
        </div>

        {/* File Info */}
        {fileInfo && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="font-medium">{fileInfo.name}</span>
              <span className="text-gray-500">•</span>
              <span>{fileInfo.size} KB</span>
              <span className="text-gray-500">•</span>
              <span>{fileInfo.treksCount} trek(s)</span>
            </div>
          </div>
        )}
      </div>

      {/* JSON Editor */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">JSON Data</h2>
        <textarea
          value={jsonData}
          onChange={(e) => setJsonData(e.target.value)}
          placeholder='Paste your JSON here or upload a file...\n\nExample:\n[\n  {\n    "trek_slug": "everest-base-camp",\n    "cloudinary_images": {\n      "hero_public_id": "treks/everest/hero/image",\n      "card_public_id": "treks/everest/card/thumb",\n      "gallery_public_ids": ["treks/everest/gallery/img1"]\n    }\n  }\n]'
          disabled={importing}
          className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleImport}
            disabled={!jsonData.trim() || importing}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {importing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Import to Database</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {(result || error) && (
        <div className={`rounded-lg border p-6 ${result?.ok
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
          }`}>
          <div className="flex items-start gap-3 mb-4">
            {result?.ok ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">
                {result?.ok ? 'Import Successful!' : 'Import Failed'}
              </h3>
              {result?.summary && (
                <p className="text-sm text-gray-700">
                  {result.summary.success} succeeded, {result.summary.failed} failed out of {result.summary.total} trek(s)
                </p>
              )}
              {error && (
                <p className="text-sm text-red-700">{error}</p>
              )}
            </div>
          </div>

          {/* Detailed Results */}
          {result?.report && result.report.length > 0 && (
            <div className="mt-4 space-y-2">
              {result.report.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${item.status === 'success'
                      ? 'bg-white border-green-200'
                      : 'bg-red-50 border-red-200'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {item.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="font-medium text-sm">{item.trek_slug}</span>
                    {item.status === 'success' && item.gallery_count > 0 && (
                      <span className="text-xs text-gray-500">
                        ({item.gallery_count} gallery images)
                      </span>
                    )}
                  </div>
                  {item.reason && (
                    <p className="mt-1 text-xs text-red-600 ml-6">{item.reason}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={clearResults}
            className="mt-4 text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Clear Results
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900 mb-3">📝 Instructions</h3>
        <ol className="space-y-2 text-sm text-blue-800">
          <li><strong>1.</strong> Upload images to Cloudinary (organized in folders: treks/slug/hero/, treks/slug/gallery/)</li>
          <li><strong>2.</strong> Copy the public IDs from Cloudinary</li>
          <li><strong>3.</strong> Create JSON with the format shown in the example</li>
          <li><strong>4.</strong> Upload the JSON file or paste it above</li>
          <li><strong>5.</strong> Click "Import to Database" to save the mappings</li>
        </ol>
      </div>
    </div>
  );
};

export default CloudinaryImport;
