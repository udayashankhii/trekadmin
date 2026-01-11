// src/pages/model/EditModeSelector.jsx
import React from 'react';
import { Edit3, RefreshCw } from 'lucide-react';

const EditModeSelector = ({ mode, onModeChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Mode</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Partial Edit */}
        <button
          onClick={() => onModeChange('partial')}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            mode === 'partial'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              mode === 'partial' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Edit3 className={`w-5 h-5 ${
                mode === 'partial' ? 'text-blue-600' : 'text-gray-600'
              }`} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                Partial Edit (PATCH)
              </h4>
              <p className="text-sm text-gray-600">
                Update specific fields only. Other fields remain unchanged.
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Example: Update only hero section subtitle
              </div>
            </div>
          </div>
        </button>

        {/* Full Edit */}
        <button
          onClick={() => onModeChange('full')}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            mode === 'full'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              mode === 'full' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <RefreshCw className={`w-5 h-5 ${
                mode === 'full' ? 'text-blue-600' : 'text-gray-600'
              }`} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                Full Edit (PUT)
              </h4>
              <p className="text-sm text-gray-600">
                Replace entire trek data. All fields must be included.
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Example: Complete trek data replacement
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default EditModeSelector;
