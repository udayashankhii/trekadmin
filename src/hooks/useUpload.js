// src/hooks/useUpload.js
import { useState, useCallback } from 'react';
import { importFullTreksBulk } from '../components/api/admin.api';
import { MAX_TREKS_PER_UPLOAD } from '../components/utils/constants';

export const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [uploadResults, setUploadResults] = useState([]);

  const upload = useCallback(async (importData) => {
    const uploadId = Date.now();
    console.log(`🚀 Upload ${uploadId}: Starting...`);
    
    setUploading(true);
    setUploadResults([]);
    setUploadProgress({ current: 0, total: 0 });

    try {
      // Validate structure
      if (!importData || typeof importData !== 'object') {
        throw new Error("Invalid import data. Expected JSON object.");
      }

      if (!importData.meta) {
        throw new Error("Missing required field: 'meta'");
      }

      if (!importData.treks) {
        throw new Error("Missing required field: 'treks'");
      }

      const treksCount = Array.isArray(importData.treks) ? importData.treks.length : 0;

      if (treksCount === 0) {
        throw new Error("No treks found in the import data.");
      }

      if (treksCount > MAX_TREKS_PER_UPLOAD) {
        throw new Error(
          `Cannot upload more than ${MAX_TREKS_PER_UPLOAD} treks at once. ` +
          `Found ${treksCount} treks. Please split into smaller batches.`
        );
      }

      console.log(`📤 Uploading ${treksCount} trek(s)...`);
      
      setUploadProgress({ current: 0, total: treksCount });

      // Upload
      const result = await importFullTreksBulk(
        importData,
        (progress) => setUploadProgress(progress)
      );

      // ⭐ FIX: Enhanced logging
      console.log(`✅ Upload ${uploadId}: Complete`, {
        success: result.success,
        importOk: result.importOk,
        successCount: result.successCount,
        failCount: result.failCount,
        stats: result.stats,
        errors: result.errors?.length || 0,
        warnings: result.warnings?.length || 0
      });

      // ⭐ FIX: Log individual results
      if (result.results && result.results.length > 0) {
        console.table(result.results.map(r => ({
          Trek: r.trek,
          Slug: r.slug,
          Success: r.success ? '✅' : '❌',
          Message: r.message
        })));
      }

      setUploadResults(result.results);

      return {
        success: result.success,
        successCount: result.successCount,
        failCount: result.failCount,
        stats: result.stats,
        errors: result.errors,
        warnings: result.warnings,
        results: result.results,
        duration: result.duration,
        importOk: result.importOk,
      };
      
    } catch (error) {
      console.error(`❌ Upload ${uploadId}: Failed`, error);

      const errorMessage = error.message || "Upload failed";
      const treksCount = importData?.treks?.length || 0;
      
      // Create error results
      const errorResults = (importData.treks || []).map((trek, i) => ({
        trek: trek?.title || trek?.slug || `Trek ${i + 1}`,
        slug: trek?.slug,
        success: false,
        message: errorMessage,
      }));
      
      setUploadResults(errorResults);

      return {
        success: false,
        error: errorMessage,
        successCount: 0,
        failCount: treksCount,
        results: errorResults,
        importOk: false,
      };
      
    } finally {
      setUploading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setUploadResults([]);
    setUploadProgress({ current: 0, total: 0 });
  }, []);

  return {
    uploading,
    uploadProgress,
    uploadResults,
    upload,
    clearResults,
  };
};
