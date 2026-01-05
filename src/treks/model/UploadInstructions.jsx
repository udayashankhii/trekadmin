import React from "react";
import { AlertCircle } from "lucide-react";
import { MAX_TREKS_PER_UPLOAD } from "../../components/utils/constants";

const UploadInstructions = () => {
  return (
    <>
      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              Upload Instructions
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Download the JSON template to see the required nested structure
              </li>
              <li>
                • The template includes meta information, regions, and trek
                details
              </li>
              <li>• Fill in your trek data following the exact structure</li>
              <li>
                • Ensure all required fields are provided (slug, title,
                region_slug, etc.)
              </li>
              <li>• Upload the JSON file and wait for the process to complete</li>
              <li>• You can upload up to {MAX_TREKS_PER_UPLOAD} treks at once</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Review results and fix any validation errors if needed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Format Reference */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">
          Import Data Format
        </h4>
        <div className="bg-white rounded border border-gray-300 p-4 overflow-x-auto">
          <pre className="text-xs text-gray-700">
            {JSON.stringify(
              {
                meta: { schema_version: "1.0", mode: "replace_nested" },
                regions: [
                  { name: "Region Name", slug: "region-slug", order: 1 },
                ],
                treks: [
                  {
                    slug: "trek-slug",
                    title: "Trek Title",
                    region_slug: "region-slug",
                    duration: "10 Days",
                    "...": "see template for full structure",
                  },
                ],
              },
              null,
              2
            )}
          </pre>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Download the full template for complete field reference
        </p>
      </div>
    </>
  );
};

export default UploadInstructions;
