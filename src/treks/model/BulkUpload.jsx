import React, { useRef } from "react";
import { FileJson, Grid } from "lucide-react";
import UploadCard from "./UploadCard";
import UploadProgress from "./UploadProgress";
import UploadResults from "./UploadResults";
import UploadInstructions from "./UploadInstructions";
import { validateFile, readFileAsText, parseJSON } from "../../components/utils/fileValidation";

import { downloadTemplate } from "../../components/utils/templateGenerator";
import { TOAST_TYPES } from "../../components/utils/constants";

const BulkUpload = ({
  uploading,
  uploadProgress,
  uploadResults,
  onUpload,
  onClearResults,
  onViewList,
  showToast,
}) => {
  const jsonInputRef = useRef(null);

  const handleJSONUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file, "json");
    if (!validation.valid) {
      showToast(validation.error, TOAST_TYPES.ERROR);
      event.target.value = "";
      return;
    }

    try {
      const text = await readFileAsText(file);
      const parsed = parseJSON(text);

      if (!parsed.success) {
        showToast(`Invalid JSON format: ${parsed.error}`, TOAST_TYPES.ERROR);
        event.target.value = "";
        return;
      }

      await onUpload(parsed.data);
    } catch (error) {
      console.error("JSON upload error:", error);
      showToast(`Failed to process file: ${error.message}`, TOAST_TYPES.ERROR);
    } finally {
      event.target.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    const result = downloadTemplate("json");
    if (result.success) {
      showToast("Template downloaded successfully", TOAST_TYPES.SUCCESS);
    } else {
      showToast("Failed to download template", TOAST_TYPES.ERROR);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <UploadCard
          title="Upload JSON File"
          description="Upload a JSON file with full trek import structure"
          Icon={FileJson}
          iconColor="text-blue-600"
          buttonText="Choose JSON File"
          buttonColor="bg-blue-600"
          onUpload={handleJSONUpload}
          onDownloadTemplate={handleDownloadTemplate}
          accept=".json"
          disabled={uploading}
          inputId="json-upload"
        />

        <UploadCard
          title="CSV Upload"
          description="CSV format not supported for full import structure"
          Icon={Grid}
          iconColor="text-gray-400"
          buttonText="Not Available"
          buttonColor="bg-gray-300"
          disabled={true}
          inputId="csv-upload"
        />
      </div>

      {/* Upload Progress */}
      {uploading && (
        <UploadProgress
          current={uploadProgress.current}
          total={uploadProgress.total}
        />
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && !uploading && (
        <UploadResults
          results={uploadResults}
          onClear={onClearResults}
          onViewList={onViewList}
        />
      )}

      {/* Instructions */}
      <UploadInstructions />
    </div>
  );
};

export default BulkUpload;
