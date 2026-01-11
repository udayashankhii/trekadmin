// src/components/model/BulkUpload.jsx
import React, { useRef, useState } from "react";
import { FileJson, Grid, CheckCircle2, AlertTriangle } from "lucide-react";
import UploadCard from "./UploadCard";
import UploadProgress from "./UploadProgress";
import UploadResults from "./UploadResults";
import UploadInstructions from "./UploadInstructions";
import { 
  validateFile, 
  readFileAsText, 
  parseJSON 
} from "../../components/utils/fileValidation";
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
  const [processing, setProcessing] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);

  const handleJSONUpload = async (event) => {
    const file = event.target.files?.[0];
    
    setFileInfo(null);
    
    if (!file) return;

    console.log('📁 File selected:', {
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.type
    });

    setProcessing(true);

    try {
      // Step 1: Validate file
      showToast('Validating file...', TOAST_TYPES.INFO);
      
      const validation = validateFile(file, "json");
      if (!validation.valid) {
        showToast(validation.error, TOAST_TYPES.ERROR);
        event.target.value = "";
        return;
      }

      // Step 2: Read file
      showToast('Reading file...', TOAST_TYPES.INFO);
      const text = await readFileAsText(file);

      // Step 3: Parse and normalize JSON
      showToast('Parsing and normalizing JSON...', TOAST_TYPES.INFO);
      const parsed = parseJSON(text);

      if (!parsed.success) {
        showToast(`Invalid JSON: ${parsed.error}`, TOAST_TYPES.ERROR);
        event.target.value = "";
        return;
      }

      // Step 4: Display file info
      const treksCount = parsed.data.treks?.length || 0;
      const regionsCount = parsed.data.regions?.length || 0;
      
      setFileInfo({
        name: file.name,
        size: file.size,
        treksCount,
        regionsCount,
        version: parsed.data.meta?.schema_version,
        normalized: true,
      });

      showToast(
        `✅ File validated & normalized: ${treksCount} trek(s), ${regionsCount} region(s)`,
        TOAST_TYPES.SUCCESS
      );

      // Step 5: Upload
      console.log('🚀 Starting upload...');
      await onUpload(parsed.data);

    } catch (error) {
      console.error("❌ File processing error:", error);
      showToast(
        `Failed to process file: ${error.message}`,
        TOAST_TYPES.ERROR
      );
    } finally {
      setProcessing(false);
      event.target.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    try {
      const result = downloadTemplate("json");
      if (result.success) {
        showToast("Template downloaded successfully", TOAST_TYPES.SUCCESS);
      } else {
        showToast("Failed to download template", TOAST_TYPES.ERROR);
      }
    } catch (error) {
      console.error("Template download error:", error);
      showToast("Failed to download template", TOAST_TYPES.ERROR);
    }
  };

  const isProcessing = uploading || processing;

  return (
    <div className="space-y-6">
      {/* File Info Display */}
      {fileInfo && !uploading && (
        <div className={`border rounded-lg p-4 ${
          fileInfo.normalized 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start gap-3">
            {fileInfo.normalized ? (
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h4 className={`font-medium mb-2 ${
                fileInfo.normalized ? 'text-blue-900' : 'text-yellow-900'
              }`}>
                {fileInfo.normalized ? 'File Ready (Schema Normalized)' : 'File Ready'}
              </h4>
              <div className={`grid grid-cols-2 gap-2 text-sm ${
                fileInfo.normalized ? 'text-blue-800' : 'text-yellow-800'
              }`}>
                <div><span className="font-medium">File:</span> {fileInfo.name}</div>
                <div><span className="font-medium">Size:</span> {(fileInfo.size / 1024).toFixed(2)} KB</div>
                <div><span className="font-medium">Treks:</span> {fileInfo.treksCount}</div>
                <div><span className="font-medium">Regions:</span> {fileInfo.regionsCount}</div>
              </div>
              {fileInfo.normalized && (
                <div className="mt-2 text-xs text-blue-700">
                  ✓ Schema differences automatically normalized for Django API compatibility
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <UploadCard
          title="Upload JSON File"
          description="Upload JSON with any supported schema format (auto-normalized)"
          Icon={FileJson}
          iconColor="text-blue-600"
          buttonText={isProcessing ? "Processing..." : "Choose JSON File"}
          buttonColor={isProcessing ? "bg-gray-400" : "bg-blue-600"}
          onUpload={handleJSONUpload}
          onDownloadTemplate={handleDownloadTemplate}
          accept=".json"
          disabled={isProcessing}
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
