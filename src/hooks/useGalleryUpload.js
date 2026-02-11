// src/hooks/useGalleryUpload.js
import { useState, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const useGalleryUpload = () => {
  const [uploading, setUploading] = useState(false);

  /**
   * Upload hero image for a trek
   * @param {string} trekSlug - Trek slug
   * @param {File} imageFile - Hero image file
   * @param {Function} onProgress - Progress callback (0-100)
   * @returns {Promise<{success: boolean, error?: string, data?: any}>}
   */
  const uploadHeroImage = useCallback(async (trekSlug, imageFile, onProgress) => {
    if (!trekSlug || !imageFile) {
      return {
        success: false,
        error: "Trek slug and image file are required",
      };
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("is_hero", "true");

      const response = await axios.post(
        `${API_BASE_URL}/treks/${trekSlug}/images/`,
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
        data: response.data,
      };
    } catch (error) {
      setUploading(false);

      let errorMessage = "Failed to upload hero image";

      if (error.response) {
        // Server responded with error
        if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
      }

      console.error("Hero image upload error:", error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  /**
   * Upload gallery images for a trek
   * @param {string} trekSlug - Trek slug
   * @param {File[]} imageFiles - Array of gallery image files
   * @param {Function} onProgress - Progress callback (0-100)
   * @returns {Promise<{success: boolean, error?: string, data?: any, count?: number}>}
   */
  const uploadGalleryImages = useCallback(async (trekSlug, imageFiles, onProgress) => {
    if (!trekSlug || !imageFiles || imageFiles.length === 0) {
      return {
        success: false,
        error: "Trek slug and at least one image file are required",
      };
    }

    if (imageFiles.length > 10) {
      return {
        success: false,
        error: "Maximum 10 gallery images allowed",
      };
    }

    setUploading(true);

    try {
      const formData = new FormData();
      
      // Append all images
      imageFiles.forEach((file, index) => {
        formData.append("images", file);
      });
      
      formData.append("is_hero", "false");

      const response = await axios.post(
        `${API_BASE_URL}/treks/${trekSlug}/images/`,
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
        data: response.data,
        count: imageFiles.length,
      };
    } catch (error) {
      setUploading(false);

      let errorMessage = "Failed to upload gallery images";

      if (error.response) {
        // Server responded with error
        if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
      }

      console.error("Gallery images upload error:", error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  /**
   * Delete an image
   * @param {string} trekSlug - Trek slug
   * @param {number} imageId - Image ID to delete
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const deleteImage = useCallback(async (trekSlug, imageId) => {
    if (!trekSlug || !imageId) {
      return {
        success: false,
        error: "Trek slug and image ID are required",
      };
    }

    try {
      await axios.delete(`${API_BASE_URL}/treks/${trekSlug}/images/${imageId}/`);

      return {
        success: true,
      };
    } catch (error) {
      let errorMessage = "Failed to delete image";

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      console.error("Image deletion error:", error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  /**
   * Get all images for a trek
   * @param {string} trekSlug - Trek slug
   * @returns {Promise<{success: boolean, error?: string, images?: any[]}>}
   */
  const getTrekImages = useCallback(async (trekSlug) => {
    if (!trekSlug) {
      return {
        success: false,
        error: "Trek slug is required",
      };
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/treks/${trekSlug}/images/`);

      return {
        success: true,
        images: response.data,
      };
    } catch (error) {
      let errorMessage = "Failed to fetch trek images";

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

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
    deleteImage,
    getTrekImages,
  };
};