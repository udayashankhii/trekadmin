// src/components/api/tours.api.js
import axios from "axios";
import adminApi from "./admin.api";

// Create a wrapper around adminApi to maintain compatibility with existing code
// that expects a response object with a .data property
// Create a wrapper around adminApi to maintain compatibility with existing code
// that expects a response object with a .data property and axios-style errors
const apiClient = {
  get: (url, config) => adminApi.get(url, config).then(data => ({ data })).catch(err => { if (err.originalError) err.response = err.originalError.response; throw err; }),
  post: (url, data, config) => adminApi.post(url, data, config).then(data => ({ data })).catch(err => { if (err.originalError) err.response = err.originalError.response; throw err; }),
  put: (url, data, config) => adminApi.put(url, data, config).then(data => ({ data })).catch(err => { if (err.originalError) err.response = err.originalError.response; throw err; }),
  patch: (url, data, config) => adminApi.patch(url, data, config).then(data => ({ data })).catch(err => { if (err.originalError) err.response = err.originalError.response; throw err; }),
  delete: (url, config) => adminApi.delete(url, config).then(data => ({ data })).catch(err => { if (err.originalError) err.response = err.originalError.response; throw err; }),
};

// ============================================================================
// TOUR LIST & SEARCH
// ============================================================================

/**
 * Get list of all tours (lightweight, no nested data)
 * GET /api/admin/tours-list/
 * @returns {Promise<Array>} Array of tour objects
 */
export const getAdminToursList = async () => {
  try {
    const response = await apiClient.get("/tours-list/");
    // Handle both flat arrays and paginated responses { results: [], ... }
    const data = response.data;
    if (data && data.results && Array.isArray(data.results)) {
      return data.results;
    }
    return data;
  } catch (error) {
    console.error("Error fetching tours list:", error);
    throw new Error(
      error.response?.data?.detail ||
      error.response?.data?.error ||
      "Failed to fetch tours"
    );
  }
};

/**
 * Search tours by query
 * GET /api/admin/tours/?search=query
 * @param {string} query - Search query
 * @returns {Promise<Array>} Filtered tour list
 */
export const searchAdminTours = async (query) => {
  try {
    const response = await apiClient.get("/tours/", {
      params: { search: query },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching tours:", error);
    throw new Error(
      error.response?.data?.detail ||
      error.response?.data?.error ||
      "Failed to search tours"
    );
  }
};

// ============================================================================
// SINGLE TOUR OPERATIONS (LIGHTWEIGHT)
// ============================================================================

/**
 * Get single tour details (lightweight - basic fields only)
 * GET /api/admin/tours/{slug}/
 * @param {string} slug - Tour slug
 * @returns {Promise<Object>} Tour object
 */
export const getAdminTour = async (slug) => {
  try {
    const response = await apiClient.get(`/tours/${slug}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tour ${slug}:`, error);
    throw new Error(
      error.response?.data?.detail ||
      error.response?.data?.error ||
      `Failed to fetch tour: ${slug}`
    );
  }
};

/**
 * Create a new tour (lightweight - basic fields only)
 * POST /api/admin/tours/
 * @param {Object} tourData - Tour data
 * @returns {Promise<Object>} Created tour object
 */
export const createAdminTour = async (tourData) => {
  try {
    const response = await apiClient.post("/tours/", tourData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error creating tour:", error);
    return {
      success: false,
      error: error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to create tour",
      errors: error.response?.data,
    };
  }
};

/**
 * Update tour (lightweight - basic fields only)
 * PATCH /api/admin/tours/{slug}/
 * @param {string} slug - Tour slug
 * @param {Object} tourData - Updated tour data
 * @returns {Promise<Object>} Updated tour object
 */
export const updateAdminTour = async (slug, tourData) => {
  try {
    const response = await apiClient.patch(`/tours/${slug}/`, tourData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error updating tour ${slug}:`, error);
    return {
      success: false,
      error: error.response?.data?.detail ||
        error.response?.data?.error ||
        `Failed to update tour: ${slug}`,
      errors: error.response?.data,
    };
  }
};

/**
 * Delete tour (lightweight endpoint)
 * DELETE /api/admin/tours/{slug}/
 * @param {string} slug - Tour slug
 * @returns {Promise<Object>} Deletion result
 */
export const deleteAdminTourLight = async (slug) => {
  try {
    await apiClient.delete(`/tours/${slug}/`);
    return {
      success: true,
      message: `Tour ${slug} deleted successfully`,
    };
  } catch (error) {
    console.error(`Error deleting tour ${slug}:`, error);
    return {
      success: false,
      error: error.response?.data?.detail ||
        error.response?.data?.error ||
        `Failed to delete tour: ${slug}`,
    };
  }
};

// ============================================================================
// FULL TOUR OPERATIONS (WITH NESTED DATA)
// ============================================================================

/**
 * Get single tour with full nested data
 * GET /api/admin/tours/{slug}/full/
 * @param {string} slug - Tour slug
 * @returns {Promise<Object>} Complete tour object with all nested data
 */
export const getAdminTourFull = async (slug) => {
  try {
    const response = await apiClient.get(`/tours/import/full/${slug}/`);
    const data = response.data;
    // If it's wrapped in the import format { tours: [...] }, extract it
    if (data && data.tours && Array.isArray(data.tours) && data.tours.length > 0) {
      return data.tours[0];
    }
    return data;
  } catch (error) {
    console.error(`Error fetching full tour ${slug}:`, error);
    throw new Error(
      error.response?.data?.detail ||
      error.response?.data?.error ||
      `Failed to fetch full tour: ${slug}`
    );
  }
};

/**
 * Update tour with full nested data (CMS-style replace)
 * PUT /api/admin/tours/{slug}/full/
 * @param {string} slug - Tour slug
 * @param {Object} tourData - Complete tour data with nested objects
 * @returns {Promise<Object>} Import result and updated tour
 */
export const updateAdminTourFull = async (slug, tourData) => {
  try {
    const response = await apiClient.put(`/tours/import/full/${slug}/`, tourData);
    return {
      success: response.data.import_result?.ok || false,
      importResult: response.data.import_result,
      tour: response.data.tour,
      stats: response.data.import_result?.stats,
      errors: response.data.import_result?.errors || [],
      warnings: response.data.import_result?.warnings || [],
    };
  } catch (error) {
    console.error(`Error updating full tour ${slug}:`, error);
    return {
      success: false,
      error: error.response?.data?.detail ||
        error.response?.data?.error ||
        `Failed to update tour: ${slug}`,
      errors: error.response?.data?.import_result?.errors || [],
      warnings: error.response?.data?.import_result?.warnings || [],
    };
  }
};

/**
 * Partial update tour with full nested data
 * PATCH /api/admin/tours/{slug}/full/
 * @param {string} slug - Tour slug
 * @param {Object} tourData - Partial tour data with nested objects
 * @returns {Promise<Object>} Import result and updated tour
 */
export const patchAdminTourFull = async (slug, tourData) => {
  try {
    const response = await apiClient.patch(`/tours/import/full/${slug}/`, tourData);
    return {
      success: response.data.import_result?.ok || false,
      importResult: response.data.import_result,
      tour: response.data.tour,
      stats: response.data.import_result?.stats,
      errors: response.data.import_result?.errors || [],
      warnings: response.data.import_result?.warnings || [],
    };
  } catch (error) {
    console.error(`Error patching full tour ${slug}:`, error);
    return {
      success: false,
      error: error.response?.data?.detail ||
        error.response?.data?.error ||
        `Failed to patch tour: ${slug}`,
      errors: error.response?.data?.import_result?.errors || [],
      warnings: error.response?.data?.import_result?.warnings || [],
    };
  }
};

/**
 * Delete tour (full endpoint - deletes all nested data)
 * DELETE /api/admin/tours/{slug}/full/
 * @param {string} slug - Tour slug
 * @returns {Promise<Object>} Deletion result
 */
export const deleteAdminTour = async (slug) => {
  try {
    await apiClient.delete(`/tours/import/full/${slug}/`);
    return {
      success: true,
      message: `Tour ${slug} deleted successfully`,
    };
  } catch (error) {
    console.error(`Error deleting tour ${slug}:`, error);
    return {
      success: false,
      error: error.response?.data?.detail ||
        error.response?.data?.error ||
        `Failed to delete tour: ${slug}`,
    };
  }
};

// ============================================================================
// BULK IMPORT OPERATIONS
// ============================================================================

/**
 * Bulk import tours from JSON payload
 * POST /api/admin/tours/import/full/
 * @param {Object} importData - Import payload with meta and tours array
 * @param {Function} onProgress - Progress callback function (optional)
 * @returns {Promise<Object>} Import results with stats, errors, and warnings
 */
export const importFullToursBulk = async (importData, onProgress = null) => {
  const startTime = Date.now();

  try {
    // Validate input
    if (!importData || typeof importData !== "object") {
      throw new Error("Invalid import data");
    }

    if (!importData.tours || !Array.isArray(importData.tours)) {
      throw new Error("Import data must contain 'tours' array");
    }

    const toursCount = importData.tours.length;

    if (toursCount === 0) {
      throw new Error("No tours to import");
    }

    console.log(`Starting bulk import of ${toursCount} tours...`);

    // Update progress: starting
    if (onProgress) {
      onProgress({ current: 0, total: toursCount });
    }

    // Make API call with upload progress tracking
    const response = await apiClient.post("/tours/import/full/", importData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentComplete = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({
            current: Math.floor((percentComplete / 100) * toursCount),
            total: toursCount,
          });
        }
      },
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const result = response.data;

    // Calculate success/fail counts from stats
    const stats = result.stats || {};
    const successCount = (stats.tours_created || 0) + (stats.tours_updated || 0);
    const failCount = (result.errors || []).length;

    console.log(`Bulk import complete in ${duration}s:`, {
      ok: result.ok,
      successCount,
      failCount,
      created: stats.tours_created,
      updated: stats.tours_updated,
    });

    // Update progress: complete
    if (onProgress) {
      onProgress({ current: toursCount, total: toursCount });
    }

    return {
      success: result.ok,
      importOk: result.ok,
      successCount,
      failCount,
      stats: result.stats,
      errors: result.errors || [],
      warnings: result.warnings || [],
      results: [result], // Wrap in array for consistency with frontend hooks
      duration: `${duration}s`,
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.error("Bulk import error:", error);

    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      error.message ||
      "Import failed";

    const apiErrors = error.response?.data?.errors || [];
    const apiWarnings = error.response?.data?.warnings || [];

    return {
      success: false,
      importOk: false,
      error: errorMessage,
      successCount: 0,
      failCount: importData?.tours?.length || 0,
      stats: error.response?.data?.stats || {},
      errors: apiErrors.length > 0 ? apiErrors : [{ error: errorMessage }],
      warnings: apiWarnings,
      results: [
        {
          ok: false,
          error: errorMessage,
          errors: apiErrors,
          warnings: apiWarnings,
        },
      ],
      duration: `${duration}s`,
    };
  }
};

/**
 * Upload tour JSON file
 * @param {File} file - JSON file to upload
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<Object>} Import results
 */
export const uploadTourFile = async (file, onProgress = null) => {
  try {
    // Validate file
    if (!file) {
      throw new Error("No file provided");
    }

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      throw new Error("File must be JSON format");
    }

    // Read and parse file
    const text = await file.text();
    const data = JSON.parse(text);

    // Use bulk import function
    return await importFullToursBulk(data, onProgress);
  } catch (error) {
    console.error("File upload error:", error);

    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON file format. Please check your JSON syntax.");
    }

    throw error;
  }
};

/**
 * Upload tour JSON file using multipart/form-data
 * Alternative method using FormData
 * @param {File} file - JSON file to upload
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<Object>} Import results
 */
export const uploadTourFileMultipart = async (file, onProgress = null) => {
  const startTime = Date.now();

  try {
    if (!file) {
      throw new Error("No file provided");
    }

    const formData = new FormData();
    formData.append("file", file);

    console.log(`Uploading file: ${file.name} (${file.size} bytes)`);

    const response = await apiClient.post("/tours/import/full/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentComplete = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({
            current: percentComplete,
            total: 100,
          });
        }
      },
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const result = response.data;
    const stats = result.stats || {};
    const successCount = (stats.tours_created || 0) + (stats.tours_updated || 0);
    const failCount = (result.errors || []).length;

    console.log(`File upload complete in ${duration}s`);

    return {
      success: result.ok,
      importOk: result.ok,
      successCount,
      failCount,
      stats: result.stats,
      errors: result.errors || [],
      warnings: result.warnings || [],
      results: [result],
      duration: `${duration}s`,
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.error("Multipart upload error:", error);

    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      error.message ||
      "File upload failed";

    return {
      success: false,
      importOk: false,
      error: errorMessage,
      successCount: 0,
      failCount: 0,
      stats: error.response?.data?.stats || {},
      errors: error.response?.data?.errors || [{ error: errorMessage }],
      warnings: error.response?.data?.warnings || [],
      results: [
        {
          ok: false,
          error: errorMessage,
        },
      ],
      duration: `${duration}s`,
    };
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate JSON file before upload
 * @param {File} file - File to validate
 * @returns {Promise<Object>} Validation result with parsed data
 */
export const validateTourJsonFile = async (file) => {
  try {
    if (!file) {
      return { valid: false, error: "No file provided" };
    }

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      return { valid: false, error: "File must be JSON format (.json)" };
    }

    const text = await file.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      return {
        valid: false,
        error: `Invalid JSON syntax: ${parseError.message}`,
      };
    }

    // Check for tours array
    if (!data.tours || !Array.isArray(data.tours)) {
      return {
        valid: false,
        error: "JSON must contain 'tours' array",
        data,
      };
    }

    if (data.tours.length === 0) {
      return {
        valid: false,
        error: "Tours array is empty",
        data,
      };
    }

    // Validate each tour has required fields
    const missingFields = [];
    data.tours.forEach((tour, index) => {
      if (!tour.title) {
        missingFields.push(`Tour ${index + 1}: missing 'title'`);
      }
      if (!tour.slug) {
        missingFields.push(`Tour ${index + 1}: missing 'slug'`);
      }
    });

    if (missingFields.length > 0) {
      return {
        valid: false,
        error: `Required fields missing:\n${missingFields.join("\n")}`,
        data,
      };
    }

    return {
      valid: true,
      data,
      toursCount: data.tours.length,
      meta: data.meta || null,
    };
  } catch (error) {
    return {
      valid: false,
      error: `Validation error: ${error.message}`,
    };
  }
};

/**
 * Get tour statistics summary
 * Useful for dashboard or analytics
 * @returns {Promise<Object>} Stats summary
 */
export const getTourStats = async () => {
  try {
    const tours = await getAdminToursList();

    const stats = {
      total: tours.length,
      published: tours.filter((t) => t.is_published).length,
      draft: tours.filter((t) => !t.is_published).length,
      byDifficulty: {},
      byTravelStyle: {},
      averageRating: 0,
      totalReviews: 0,
    };

    // Group by difficulty
    tours.forEach((tour) => {
      const difficulty = tour.difficulty || "Unknown";
      stats.byDifficulty[difficulty] = (stats.byDifficulty[difficulty] || 0) + 1;
    });

    // Group by travel style
    tours.forEach((tour) => {
      const style = tour.travel_style || "General";
      stats.byTravelStyle[style] = (stats.byTravelStyle[style] || 0) + 1;
    });

    // Calculate average rating
    const toursWithRating = tours.filter((t) => t.rating > 0);
    if (toursWithRating.length > 0) {
      const totalRating = toursWithRating.reduce((sum, t) => sum + (t.rating || 0), 0);
      stats.averageRating = (totalRating / toursWithRating.length).toFixed(2);
    }

    // Total reviews
    stats.totalReviews = tours.reduce((sum, t) => sum + (t.reviews_count || 0), 0);

    return stats;
  } catch (error) {
    console.error("Error calculating tour stats:", error);
    throw error;
  }
};

// Export all functions
export default {
  // List & Search
  getAdminToursList,
  searchAdminTours,

  // Single Tour (Lightweight)
  getAdminTour,
  createAdminTour,
  updateAdminTour,
  deleteAdminTourLight,

  // Full Tour (Nested Data)
  getAdminTourFull,
  updateAdminTourFull,
  patchAdminTourFull,
  deleteAdminTour,

  // Bulk Import
  importFullToursBulk,
  uploadTourFile,
  uploadTourFileMultipart,

  // Utilities
  validateTourJsonFile,
  getTourStats,
};