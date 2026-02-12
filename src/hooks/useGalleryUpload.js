// src/hooks/useGalleryUpload.js
/**
 * useGalleryUpload Hook - PRODUCTION VERSION
 * 
 * Production-grade custom hook for managing image uploads (hero and gallery)
 * for both treks and tours with full CRUD operations.
 * 
 * CRITICAL FIX: 
 * - GET requests use PUBLIC endpoints: /api/treks/{slug}/hero/ and /api/treks/{slug}/gallery/
 * - POST/PATCH/DELETE use ADMIN endpoints: /api/admin/treks/{slug}/media/hero/
 * 
 * Features:
 * - Upload/Update/Delete hero images
 * - Upload/Update/Delete gallery images
 * - Fetch existing images
 * - Progress tracking
 * - Comprehensive error handling
 * - Support for both treks and tours
 * - Retry logic for failed uploads
 */

import { useState, useCallback } from "react";
import adminApi from "../components/api/admin.api";
import axios from "axios";

// Constants
const MAX_GALLERY_IMAGES = 5;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_RETRIES = 2;

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

/**
 * Validate image file
 */
const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!file.type || !file.type.startsWith('image/')) {
    return { valid: false, error: 'File is not an image' };
  }

  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported format. Please use ${SUPPORTED_FORMATS.join(', ')}`
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds ${MAX_FILE_SIZE_MB}MB limit`
    };
  }

  return { valid: true };
};

/**
 * Extract error message from error object
 */
const extractErrorMessage = (error, fallback = 'Operation failed') => {
  if (!error) return fallback;

  if (error.response) {
    const data = error.response.data;
    if (data?.detail) return data.detail;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (typeof data === 'string') return data;
  }

  if (error.message) return error.message;

  return fallback;
};

/**
 * Sleep function for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const useGalleryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch existing hero image
   * Uses PUBLIC endpoint: /api/treks/{slug}/hero/ or /api/tours/{slug}/hero/
   * 
   * @param {string} slug - Resource slug
   * @param {string} type - Resource type ('treks' or 'tours')
   * @returns {Promise<{success: boolean, error?: string, data?: any}>}
   */
  const getHeroImage = useCallback(async (slug, type = 'treks') => {
    if (!slug || typeof slug !== 'string') {
      return { success: false, error: 'Invalid slug provided' };
    }

    const resourceType = type === 'tours' ? 'tours' : 'treks';
    setLoading(true);

    try {
      // CRITICAL: Use PUBLIC endpoint for GET
      const response = await axios.get(`${API_BASE_URL}/${resourceType}/${slug}/hero/`);
      const data = response.data;

      setLoading(false);
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      setLoading(false);
      const errorMessage = extractErrorMessage(error, 'Failed to fetch hero image');
      console.error("Fetch hero image error:", error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  /**
   * Fetch existing gallery images
   * Uses PUBLIC endpoint: /api/treks/{slug}/gallery/ or /api/tours/{slug}/gallery/
   * 
   * @param {string} slug - Resource slug
   * @param {string} type - Resource type ('treks' or 'tours')
   * @returns {Promise<{success: boolean, error?: string, data?: any[], count?: number}>}
   */
  const getGalleryImages = useCallback(async (slug, type = 'treks') => {
    if (!slug || typeof slug !== 'string') {
      return { success: false, error: 'Invalid slug provided' };
    }

    const resourceType = type === 'tours' ? 'tours' : 'treks';
    setLoading(true);

    try {
      // CRITICAL: Use PUBLIC endpoint for GET
      const response = await axios.get(`${API_BASE_URL}/${resourceType}/${slug}/gallery/`);
      const data = response.data;

      // Handle paginated response
      const images = data?.results || (Array.isArray(data) ? data : []);
      const count = data?.count || images.length;

      setLoading(false);
      return {
        success: true,
        data: images,
        count: count,
      };
    } catch (error) {
      setLoading(false);
      const errorMessage = extractErrorMessage(error, 'Failed to fetch gallery images');
      console.error("Fetch gallery images error:", error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  /**
   * Upload hero image with retry logic
   * Uses ADMIN endpoint: /api/admin/treks/{slug}/media/hero/
   */
  const uploadHeroImage = useCallback(async (slug, imageFile, onProgress, type = 'treks') => {
    if (!slug || typeof slug !== 'string') {
      return { success: false, error: 'Invalid slug provided' };
    }

    const validation = validateImageFile(imageFile);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const resourceType = type === 'tours' ? 'tours' : 'treks';
    setUploading(true);

    let lastError = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retrying hero image upload (attempt ${attempt + 1}/${MAX_RETRIES + 1})...`);
          await sleep(1000 * attempt);
        }

        const formData = new FormData();
        formData.append("image", imageFile);

        // Use ADMIN endpoint for POST
        const response = await adminApi.post(
          `/${resourceType}/${slug}/media/hero/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              if (onProgress && progressEvent.total) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress(percentCompleted);
              }
            },
          }
        );

        setUploading(false);

        return {
          success: true,
          data: response,
          url: response.hero_image_url || response.url || response.image_url,
        };
      } catch (error) {
        lastError = error;

        if (error.response?.status >= 400 && error.response?.status < 500) {
          break;
        }
      }
    }

    setUploading(false);

    const errorMessage = extractErrorMessage(lastError, 'Failed to upload hero image');
    console.error("Hero image upload error:", lastError);

    return {
      success: false,
      error: errorMessage,
    };
  }, []);

  /**
   * Upload gallery images with retry logic
   * Uses ADMIN endpoint: /api/admin/treks/{slug}/media/gallery/
   */
  const uploadGalleryImages = useCallback(async (slug, imageFiles, onProgress, type = 'treks') => {
    if (!slug || typeof slug !== 'string') {
      return { success: false, error: 'Invalid slug provided' };
    }

    if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
      return { success: false, error: 'No images provided' };
    }

    if (imageFiles.length > MAX_GALLERY_IMAGES) {
      return {
        success: false,
        error: `Maximum ${MAX_GALLERY_IMAGES} gallery images allowed per upload`
      };
    }

    const invalidFiles = [];
    imageFiles.forEach((file, index) => {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        invalidFiles.push(`Image ${index + 1}: ${validation.error}`);
      }
    });

    if (invalidFiles.length > 0) {
      return {
        success: false,
        error: `Invalid images: ${invalidFiles.join('; ')}`
      };
    }

    const resourceType = type === 'tours' ? 'tours' : 'treks';
    setUploading(true);

    let lastError = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retrying gallery upload (attempt ${attempt + 1}/${MAX_RETRIES + 1})...`);
          await sleep(1000 * attempt);
        }

        const formData = new FormData();

        imageFiles.forEach((file) => {
          formData.append("images", file);
        });

        // Use ADMIN endpoint for POST
        const response = await adminApi.post(
          `/${resourceType}/${slug}/media/gallery/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              if (onProgress && progressEvent.total) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress(percentCompleted);
              }
            },
          }
        );

        setUploading(false);

        return {
          success: true,
          data: response,
          count: response.uploaded || imageFiles.length,
          items: response.items || [],
        };
      } catch (error) {
        lastError = error;

        if (error.response?.status >= 400 && error.response?.status < 500) {
          break;
        }
      }
    }

    setUploading(false);

    const errorMessage = extractErrorMessage(lastError, 'Failed to upload gallery images');
    console.error("Gallery images upload error:", lastError);

    return {
      success: false,
      error: errorMessage,
    };
  }, []);

  /**
   * Update hero image (replace image or update metadata)
   * Uses ADMIN endpoint: /api/admin/treks/{slug}/media/hero/
   */
  const updateHeroImage = useCallback(async (slug, imageFile = null, metadata = {}, onProgress, type = 'treks') => {
    if (!slug || typeof slug !== 'string') {
      return { success: false, error: 'Invalid slug provided' };
    }

    if (imageFile) {
      const validation = validateImageFile(imageFile);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
    }

    const resourceType = type === 'tours' ? 'tours' : 'treks';
    setUploading(true);

    try {
      const formData = new FormData();

      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Add metadata if provided
      if (Object.keys(metadata).length > 0) {
        formData.append("metadata", JSON.stringify([metadata]));
      }

      // Use ADMIN endpoint for PATCH
      const response = await adminApi.patch(
        `/${resourceType}/${slug}/media/hero/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          },
        }
      );

      setUploading(false);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      setUploading(false);
      const errorMessage = extractErrorMessage(error, 'Failed to update hero image');
      console.error("Hero image update error:", error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  /**
   * Delete hero image
   * Uses ADMIN endpoint: /api/admin/treks/{slug}/media/hero/
   */
  const deleteHeroImage = useCallback(async (slug, type = 'treks') => {
    if (!slug || typeof slug !== 'string') {
      return { success: false, error: 'Invalid slug provided' };
    }

    const resourceType = type === 'tours' ? 'tours' : 'treks';

    try {
      // Use ADMIN endpoint for DELETE
      await adminApi.delete(`/${resourceType}/${slug}/media/hero/`);

      return {
        success: true,
      };
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Failed to delete hero image');
      console.error("Hero image deletion error:", error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  /**
   * Update a gallery image
   * Uses ADMIN endpoint: /api/admin/treks/{slug}/media/gallery/{id}/
   */
  const updateGalleryImage = useCallback(async (slug, imageId, imageFile = null, metadata = {}, onProgress, type = 'treks') => {
    if (!slug || typeof slug !== 'string') {
      return { success: false, error: 'Invalid slug provided' };
    }

    if (!imageId) {
      return { success: false, error: 'Invalid image ID provided' };
    }

    if (imageFile) {
      const validation = validateImageFile(imageFile);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
    }

    const resourceType = type === 'tours' ? 'tours' : 'treks';
    setUploading(true);

    try {
      const formData = new FormData();

      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Add metadata if provided
      if (Object.keys(metadata).length > 0) {
        if (metadata.caption !== undefined) {
          formData.append("caption", metadata.caption);
        }
        if (metadata.alt_text !== undefined) {
          formData.append("alt_text", metadata.alt_text);
        }
        if (metadata.order !== undefined) {
          formData.append("order", metadata.order.toString());
        }
      }

      // Use ADMIN endpoint for PATCH
      const response = await adminApi.patch(
        `/${resourceType}/${slug}/media/gallery/${imageId}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          },
        }
      );

      setUploading(false);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      setUploading(false);
      const errorMessage = extractErrorMessage(error, 'Failed to update gallery image');
      console.error("Gallery image update error:", error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  /**
   * Delete a gallery image
   * Uses ADMIN endpoint: /api/admin/treks/{slug}/media/gallery/{id}/
   */
  const deleteGalleryImage = useCallback(async (slug, imageId, type = 'treks') => {
    if (!slug || typeof slug !== 'string') {
      return { success: false, error: 'Invalid slug provided' };
    }

    if (!imageId) {
      return { success: false, error: 'Invalid image ID provided' };
    }

    const resourceType = type === 'tours' ? 'tours' : 'treks';

    try {
      // Use ADMIN endpoint for DELETE
      await adminApi.delete(`/${resourceType}/${slug}/media/gallery/${imageId}/`);

      return {
        success: true,
      };
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Failed to delete gallery image');
      console.error("Gallery image deletion error:", error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  return {
    uploading,
    loading,
    uploadHeroImage,
    uploadGalleryImages,
    updateHeroImage,
    deleteHeroImage,
    updateGalleryImage,
    deleteGalleryImage,
    getHeroImage,
    getGalleryImages,
    // Utility exports
    validateImageFile,
    MAX_GALLERY_IMAGES,
    MAX_FILE_SIZE_MB,
    SUPPORTED_FORMATS,
  };
};