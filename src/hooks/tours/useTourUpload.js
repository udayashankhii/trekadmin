// // src/hooks/useTourUpload.js
// import { useState, useCallback } from "react";
// import { importFullToursBulk } from "../../components/api/admin.api";
// import { MAX_TOURS_PER_UPLOAD } from "../../components/utils/constants";

// export const useTourUpload = () => {
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
//   const [uploadResults, setUploadResults] = useState([]);

//   const upload = useCallback(async (importData) => {
//     const uploadId = Date.now();
//     console.log(`Upload ${uploadId}: Starting...`);

//     setUploading(true);
//     setUploadResults([]);
//     setUploadProgress({ current: 0, total: 0 });

//     try {
//       // Validate structure
//       if (!importData || typeof importData !== "object") {
//         throw new Error("Invalid import data. Expected JSON object.");
//       }

//       // Check for tours array
//       if (!importData.tours) {
//         throw new Error("Missing required field: tours");
//       }

//       const toursCount = Array.isArray(importData.tours) ? importData.tours.length : 0;

//       if (toursCount === 0) {
//         throw new Error("No tours found in the import data.");
//       }

//       if (toursCount > MAX_TOURS_PER_UPLOAD) {
//         throw new Error(
//           `Cannot upload more than ${MAX_TOURS_PER_UPLOAD} tours at once. Found ${toursCount} tours. Please split into smaller batches.`
//         );
//       }

//       console.log(`Uploading ${toursCount} tours...`);
//       setUploadProgress({ current: 0, total: toursCount });

//       // Upload with progress callback
//       const result = await importFullToursBulk(importData, (progress) => {
//         setUploadProgress(progress);
//       });

//       console.log(`Upload ${uploadId}: Complete`, {
//         success: result.success,
//         importOk: result.importOk,
//         successCount: result.successCount,
//         failCount: result.failCount,
//         stats: result.stats,
//       });

//       // Store results
//       setUploadResults(result.results || []);

//       return {
//         success: result.success,
//         successCount: result.successCount,
//         failCount: result.failCount,
//         stats: result.stats,
//         errors: result.errors,
//         warnings: result.warnings,
//         results: result.results,
//         duration: result.duration,
//         importOk: result.importOk,
//       };
//     } catch (error) {
//       console.error(`Upload ${uploadId}: Failed`, error);

//       const errorMessage = error.message || "Upload failed";
//       const toursCount = importData?.tours?.length || 0;

//       // Create error results
//       const errorResults = (importData?.tours || []).map((tour, i) => ({
//         tour: tour?.title || tour?.slug || `Tour ${i + 1}`,
//         slug: tour?.slug,
//         success: false,
//         message: errorMessage,
//       }));

//       setUploadResults(errorResults);

//       return {
//         success: false,
//         error: errorMessage,
//         successCount: 0,
//         failCount: toursCount,
//         results: errorResults,
//         importOk: false,
//       };
//     } finally {
//       setUploading(false);
//     }
//   }, []);

//   const clearResults = useCallback(() => {
//     setUploadResults([]);
//     setUploadProgress({ current: 0, total: 0 });
//   }, []);

//   return {
//     uploading,
//     uploadProgress,
//     uploadResults,
//     upload,
//     clearResults,
//   };
// };



// src/hooks/tours/useTourUpload.js
import { useState, useCallback } from "react";
import { importFullToursBulk } from "../../components/api/tours.api";
import { MAX_TOURS_PER_UPLOAD } from "../../components/utils/constants";

export const useTourUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [uploadResults, setUploadResults] = useState([]);

  const upload = useCallback(async (importData) => {
    const uploadId = Date.now();
    console.log(`Upload ${uploadId}: Starting...`);

    setUploading(true);
    setUploadResults([]);
    setUploadProgress({ current: 0, total: 0 });

    try {
      // Validate structure
      if (!importData || typeof importData !== "object") {
        throw new Error("Invalid import data. Expected JSON object.");
      }

      // Check for tours array
      if (!importData.tours) {
        throw new Error("Missing required field: tours");
      }

      const toursCount = Array.isArray(importData.tours) ? importData.tours.length : 0;

      if (toursCount === 0) {
        throw new Error("No tours found in the import data.");
      }

      if (toursCount > MAX_TOURS_PER_UPLOAD) {
        throw new Error(
          `Cannot upload more than ${MAX_TOURS_PER_UPLOAD} tours at once. Found ${toursCount} tours. Please split into smaller batches.`
        );
      }

      console.log(`Uploading ${toursCount} tours...`);
      setUploadProgress({ current: 0, total: toursCount });

      // Upload with progress callback
      const result = await importFullToursBulk(importData, (progress) => {
        setUploadProgress(progress);
      });

      console.log(`Upload ${uploadId}: Complete`, {
        success: result.success,
        importOk: result.importOk,
        successCount: result.successCount,
        failCount: result.failCount,
        stats: result.stats,
      });

      // Store results
      setUploadResults(result.results || []);

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
      console.error(`Upload ${uploadId}: Failed`, error);

      const errorMessage = error.message || "Upload failed";
      const toursCount = importData?.tours?.length || 0;

      // Create error results
      const errorResults = (importData?.tours || []).map((tour, i) => ({
        tour: tour?.title || tour?.slug || `Tour ${i + 1}`,
        slug: tour?.slug,
        success: false,
        message: errorMessage,
      }));

      setUploadResults(errorResults);

      return {
        success: false,
        error: errorMessage,
        successCount: 0,
        failCount: toursCount,
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