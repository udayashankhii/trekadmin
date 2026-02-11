// src/hooks/useGalleryUpload.js
/**
 * useGalleryUpload Hook
 * 
 * Production-grade custom hook for managing image uploads (hero and gallery)
 * for both treks and tours.
 * 
 * Features:
 * - Upload hero images
 * - Upload multiple gallery images
 * - Update image metadata
 * - Delete images
 * - Progress tracking
 * - Comprehensive error handling
 * - Support for both treks and tours
 * - Retry logic for failed uploads
 */

import { useState, useCallback } from "react";
import adminApi from "../components/api/admin.api";

// Constants
const MAX_GALLERY_IMAGES = 10;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_RETRIES = 2;

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {{valid: boolean, error?: string}}
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
 * @param {Error} error - Error object
 * @param {string} fallback - Fallback error message
 * @returns {string}
 */
const extractErrorMessage = (error, fallback = 'Operation failed') => {
  if (!error) return fallback;

  // Check response data
  if (error.response) {
    const data = error.response.data;
    if (data?.detail) return data.detail;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (typeof data === 'string') return data;
  }

  // Check error message
  if (error.message) return error.message;

  // Fallback
  return fallback;
};

/**
 * Sleep function for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const useGalleryUpload = () => {
  const [uploading, setUploading] = useState(false);

  /**
   * Upload hero image with retry logic
   * @param {string} slug - Resource slug
   * @param {File} imageFile - Hero image file
   * @param {Function} onProgress - Progress callback (0-100)
   * @param {string} type - Resource type ('treks' or 'tours')
   * @returns {Promise<{success: boolean, error?: string, data?: any}>}
   */
  const uploadHeroImage = useCallback(async (slug, imageFile, onProgress, type = 'treks') => {
    // Validate inputs
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
    
    // Retry logic
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retrying hero image upload (attempt ${attempt + 1}/${MAX_RETRIES + 1})...`);
          await sleep(1000 * attempt); // Exponential backoff
        }

        const formData = new FormData();
        formData.append("image", imageFile);

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

        const data = response.data || response;
        
        return {
          success: true,
          data: data,
          url: data.hero_image_url || data.url,
        };
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          break;
        }
      }
    }

    // All retries failed
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
   * @param {string} slug - Resource slug
   * @param {File[]} imageFiles - Array of gallery image files
   * @param {Function} onProgress - Progress callback (0-100)
   * @param {string} type - Resource type ('treks' or 'tours')
   * @returns {Promise<{success: boolean, error?: string, data?: any, count?: number, items?: any[]}>}
   */
  const uploadGalleryImages = useCallback(async (slug, imageFiles, onProgress, type = 'treks') => {
    // Validate inputs
    if (!slug || typeof slug !== 'string') {
      return { success: false, error: 'Invalid slug provided' };
    }

    if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
      return { success: false, error: 'No images provided' };
    }

    if (imageFiles.length > MAX_GALLERY_IMAGES) {
      return { 
        success: false, 
        error: `Maximum ${MAX_GALLERY_IMAGES} gallery images allowed` 
      };
    }

    // Validate each file
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

    // Retry logic
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retrying gallery upload (attempt ${attempt + 1}/${MAX_RETRIES + 1})...`);
          await sleep(1000 * attempt); // Exponential backoff
        }

        const formData = new FormData();

        // Append all images with the key 'images'
        imageFiles.forEach((file) => {
          formData.append("images", file);
        });

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
        const data = response.data || response;

        return {
          success: true,
          data: data,
          count: data.uploaded || imageFiles.length,
          items: data.items || [],
        };
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          break;
        }
      }
    }

    // All retries failed
    setUploading(false);
    
    const errorMessage = extractErrorMessage(lastError, 'Failed to upload gallery images');
    console.error("Gallery images upload error:", lastError);

    return {
      success: false,
      error: errorMessage,
    };
  }, []);

  /**
   * Update hero image metadata or replace image
   * @param {string} slug - Resource slug
   * @param {File|null} imageFile - Optional new image file
   * @param {Object} metadata - Metadata (image_alt, image_caption)
   * @param {string} type - Resource type ('treks' or 'tours')
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const updateHeroImage = useCallback(async (slug, imageFile = null, metadata = {}, type = 'treks') => {
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

    try {
      const formData = new FormData();

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (metadata.image_alt) {
        formData.append("image_alt", metadata.image_alt);
      }

      if (metadata.image_caption) {
        formData.append("image_caption", metadata.image_caption);
      }

      const response = await adminApi.patch(
        `/${resourceType}/${slug}/media/hero/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
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
   * @param {string} slug - Resource slug
   * @param {string} type - Resource type ('treks' or 'tours')
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const deleteHeroImage = useCallback(async (slug, type = 'treks') => {
    if (!slug || typeof slug !== 'string') {
      return { success: false, error: 'Invalid slug provided' };
    }

    const resourceType = type === 'tours' ? 'tours' : 'treks';

    try {
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
   * @param {string} slug - Resource slug
   * @param {number} imageId - Image ID
   * @param {File|null} imageFile - Optional new image file
   * @param {Object} metadata - Metadata (caption, alt_text, order)
   * @param {string} type - Resource type ('treks' or 'tours')
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const updateGalleryImage = useCallback(async (slug, imageId, imageFile = null, metadata = {}, type = 'treks') => {
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

    try {
      const formData = new FormData();

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (metadata.caption !== undefined) {
        formData.append("caption", metadata.caption);
      }

      if (metadata.alt_text !== undefined) {
        formData.append("alt_text", metadata.alt_text);
      }

      if (metadata.order !== undefined) {
        formData.append("order", metadata.order.toString());
      }

      const response = await adminApi.patch(
        `/${resourceType}/${slug}/media/gallery/${imageId}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
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
   * @param {string} slug - Resource slug
   * @param {number} imageId - Image ID to delete
   * @param {string} type - Resource type ('treks' or 'tours')
   * @returns {Promise<{success: boolean, error?: string}>}
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

  /**
   * Get all images for a resource
   * @param {string} slug - Resource slug
   * @param {string} type - Resource type ('treks' or 'tours')
   * @returns {Promise<{success: boolean, error?: string, hero?: any, gallery?: any[]}>}
   */
  const getResourceImages = useCallback(async (slug, type = 'treks') => {
    if (!slug || typeof slug !== 'string') {
      return { success: false, error: 'Invalid slug provided' };
    }

    const resourceType = type === 'tours' ? 'tours' : 'treks';

    try {
      const response = await adminApi.get(`/${resourceType}/${slug}/media/`);
      const data = response.data || response;

      return {
        success: true,
        hero: data.hero || null,
        gallery: Array.isArray(data.gallery) ? data.gallery : [],
      };
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Failed to fetch images');
      console.error("Fetch images error:", error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  return {
    uploading,
    uploadHeroImage,
    uploadGalleryImages,
    updateHeroImage,
    deleteHeroImage,
    updateGalleryImage,
    deleteGalleryImage,
    getResourceImages,
    // Utility exports
    validateImageFile,
    MAX_GALLERY_IMAGES,
    MAX_FILE_SIZE_MB,
    SUPPORTED_FORMATS,
  };
};