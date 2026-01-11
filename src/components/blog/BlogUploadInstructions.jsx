import React from "react";
import { AlertCircle } from "lucide-react";
import { MAX_BLOGS_PER_UPLOAD } from "../../components/utils/constants";

const BlogUploadInstructions = () => {
  return (
    <>
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              Upload Instructions
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Download the JSON template to see the expected structure</li>
              <li>• Add posts under the top-level `posts` array</li>
              <li>• Each post must include at least `slug` and `title`</li>
              <li>• Use camelCase keys (contentType, metaTitle, publishDate)</li>
              <li>• Upload the JSON file and wait for the import to finish</li>
              <li>• You can upload up to {MAX_BLOGS_PER_UPLOAD} posts at once</li>
              <li>• Maximum file size: 5MB</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Import Data Format</h4>
        <div className="bg-white rounded border border-gray-300 p-4 overflow-x-auto">
          <pre className="text-xs text-gray-700">
            {JSON.stringify(
              {
                posts: [
                  {
                    slug: "everest-base-camp-trek-guide",
                    title: "Everest Base Camp Trek Guide",
                    status: "published",
                    contentType: "article",
                    publishDate: "2025-01-01T00:00:00Z",
                    categorySlug: "trekking",
                    regionSlug: "everest",
                    author: { name: "Evertrek Nepal", slug: "evertrek-nepal" },
                  },
                ],
              },
              null,
              2
            )}
          </pre>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Download the template for a full field reference
        </p>
      </div>
    </>
  );
};

export default BlogUploadInstructions;
