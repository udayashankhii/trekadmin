import { useState } from 'react';
import { importFullTreksBulk } from '../components/api/admin.api';
import { MAX_TREKS_PER_UPLOAD } from '../components/utils/constants';

export const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [uploadResults, setUploadResults] = useState([]);

  const upload = async (importData) => {
    setUploading(true);
    setUploadResults([]);

    try {
      // Validate structure
      if (!importData || typeof importData !== 'object') {
        throw new Error("Invalid import data. Expected JSON object.");
      }

      if (!importData.meta) {
        throw new Error("Invalid import format. Missing 'meta' field.");
      }

      if (!importData.treks) {
        throw new Error("Invalid import format. Missing 'treks' field.");
      }

      const treksCount = Array.isArray(importData.treks) ? importData.treks.length : 0;

      if (treksCount === 0) {
        throw new Error("No treks found in the import data.");
      }

      if (treksCount > MAX_TREKS_PER_UPLOAD) {
        throw new Error(`Cannot upload more than ${MAX_TREKS_PER_UPLOAD} treks at once. You have ${treksCount} treks.`);
      }

      console.log(`📤 Uploading ${treksCount} trek(s)...`);
      console.log("📦 Import Data Structure:", {
        meta: importData.meta,
        regionsCount: importData.regions?.length || 0,
        treksCount,
        firstTrek: importData.treks[0]?.slug
      });

      setUploadProgress({ current: 0, total: treksCount });

      const result = await importFullTreksBulk(
        importData,
        setUploadProgress
      );

      console.log("✅ Upload Result:", result);

      const { results = [], stats = {}, errors = [] } = result;

      setUploadResults(results);

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.length - successCount;

      // Log detailed errors if any
      if (errors.length > 0) {
        console.error("❌ Upload Errors:", errors);
        errors.forEach((err, idx) => {
          console.error(`  Error ${idx + 1}:`, {
            trek: err.trek || 'Unknown',
            message: err.message || err.error || err
          });
        });
      }

      // Log stats
      if (stats) {
        console.log("📊 Upload Stats:", stats);
      }

      return {
        success: failCount === 0,
        successCount,
        failCount,
        stats,
        errors,
      };
    } catch (error) {
      console.error("❌ Upload Error:", {
        message: error.message,
        status: error.status,
        data: error.data,
        stack: error.stack
      });

      // Extract detailed error message
      let errorMessage = error.message || "Upload failed";
      
      if (error.data) {
        // Django validation errors
        if (error.data.detail) {
          errorMessage = error.data.detail;
        } else if (error.data.errors) {
          // Field-specific errors
          const fieldErrors = Object.entries(error.data.errors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('; ');
          errorMessage = `Validation errors: ${fieldErrors}`;
        } else if (typeof error.data === 'string') {
          errorMessage = error.data;
        }
      }

      return {
        success: false,
        error: errorMessage,
        successCount: 0,
        failCount: 0
      };
    } finally {
      setUploading(false);
    }
  };

  const clearResults = () => {
    setUploadResults([]);
    setUploadProgress({ current: 0, total: 0 });
  };

  return {
    uploading,
    uploadProgress,
    uploadResults,
    upload,
    clearResults,
  };
};
