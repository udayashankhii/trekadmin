// src/pages/model/JsonEditor.jsx
import React from 'react';
import { AlertCircle, CheckCircle2, Copy } from 'lucide-react';

const JsonEditor = ({ value, onChange, error, mode }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">JSON Editor</h3>
          {error && (
            <span className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              Invalid JSON
            </span>
          )}
          {!error && value && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              Valid JSON
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Copy className="w-4 h-4" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-[600px] p-6 font-mono text-sm focus:outline-none resize-none ${
            error ? 'bg-red-50' : 'bg-white'
          }`}
          spellCheck={false}
          placeholder="Enter JSON data..."
        />
        
        {error && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-100 border-t-2 border-red-500 px-6 py-3">
            <p className="text-sm text-red-800 font-mono">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JsonEditor;
