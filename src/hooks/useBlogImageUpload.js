// src/hooks/useBlogImageUpload.js
/**
 * useBlogImageUpload Hook - PRODUCTION VERSION
 *
 * Production-grade hook for managing all blog post media operations with full CRUD.
 * Integrates with the admin API for featured, thumbnail, and inline image management.
 *
 * NOTE: Blog posts use ADMIN endpoints for both GET and POST/PATCH/DELETE operations
 * This is different from treks/tours which use public endpoints for GET
 *
 * API Endpoints covered:
 *   Featured Image:
 *     POST   /api/admin/blog-posts/{slug}/media/featured/
 *     GET    /api/admin/blog-posts/{slug}/media/featured/
 *     PATCH  /api/admin/blog-posts/{slug}/media/featured/
 *     DELETE /api/admin/blog-posts/{slug}/media/featured/
 *
 *   Thumbnail Image:
 *     POST   /api/admin/blog-posts/{slug}/media/thumbnail/
 *     GET    /api/admin/blog-posts/{slug}/media/thumbnail/
 *     PATCH  /api/admin/blog-posts/{slug}/media/thumbnail/
 *     DELETE /api/admin/blog-posts/{slug}/media/thumbnail/
 *
 *   Inline Images (multiple):
 *     POST   /api/admin/blog-posts/{slug}/media/inline/
 *     GET    /api/admin/blog-posts/{slug}/media/inline/{id}/
 *     PATCH  /api/admin/blog-posts/{slug}/media/inline/{id}/
 *     DELETE /api/admin/blog-posts/{slug}/media/inline/{id}/
 */

import { useState, useCallback } from "react";
import adminApi from "../components/api/admin.api";

// Constants
const MAX_INLINE_IMAGES = 5;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const SUPPORTED_FORMATS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_RETRIES = 2;

// Utilities
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extract human-readable error from API errors
 */
const extractErrorMessage = (error, fallback = "An error occurred") => {
    if (error?.message) return error.message;
    if (error?.data?.detail) return error.data.detail;
    if (error?.data?.error) return error.data.error;
    if (error?.response?.data?.detail) return error.response.data.detail;
    if (typeof error === "string") return error;
    return fallback;
};

/**
 * Validate an image file before upload
 */
export const validateBlogImageFile = (file) => {
    if (!file) {
        return { valid: false, error: "No file provided" };
    }

    if (!(file instanceof File || file instanceof Blob)) {
        return { valid: false, error: "Invalid file object" };
    }

    if (!SUPPORTED_FORMATS.includes(file.type)) {
        return {
            valid: false,
            error: `Unsupported format: ${file.type || "unknown"}. Use JPEG, PNG, or WebP.`,
        };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            valid: false,
            error: `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum is ${MAX_FILE_SIZE_MB}MB.`,
        };
    }

    return { valid: true };
};

/**
 * Custom hook for blog post image uploads with full CRUD
 */
export const useBlogImageUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [errors, setErrors] = useState([]);

    const clearErrors = useCallback(() => setErrors([]), []);

    // ========================================
    // FEATURED IMAGE OPERATIONS
    // ========================================

    /**
     * Upload featured image
     * POST /blog-posts/{slug}/media/featured/
     */
    const uploadFeaturedImage = useCallback(async (slug, imageFile, onProgress) => {
        if (!slug || typeof slug !== "string") {
            return { success: false, error: "Invalid slug provided" };
        }

        const validation = validateBlogImageFile(imageFile);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        setUploading(true);
        setProgress(0);

        let lastError = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                if (attempt > 0) {
                    console.log(`Retrying featured image upload (attempt ${attempt + 1}/${MAX_RETRIES + 1})...`);
                    await sleep(1000 * attempt);
                }

                const formData = new FormData();
                formData.append("image", imageFile);

                const response = await adminApi.post(
                    `/blog-posts/${slug}/media/featured/`,
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                        onUploadProgress: (progressEvent) => {
                            if (progressEvent.total) {
                                const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                setProgress(pct);
                                if (onProgress) onProgress(pct);
                            }
                        },
                    }
                );

                setUploading(false);
                setProgress(100);

                return {
                    success: true,
                    data: response,
                };
            } catch (error) {
                lastError = error;
                console.error(`Featured image upload attempt ${attempt + 1} failed:`, error);
            }
        }

        setUploading(false);
        const errorMessage = extractErrorMessage(lastError, "Failed to upload featured image");
        return { success: false, error: errorMessage };
    }, []);

    /**
     * Get featured image
     * GET /blog-posts/{slug}/media/featured/
     */
    const getFeaturedImage = useCallback(async (slug) => {
        if (!slug) return { success: false, error: "Invalid slug" };

        setLoading(true);

        try {
            const response = await adminApi.get(`/blog-posts/${slug}/media/featured/`);
            setLoading(false);
            return { success: true, data: response };
        } catch (error) {
            setLoading(false);
            return { success: false, error: extractErrorMessage(error, "Failed to get featured image") };
        }
    }, []);

    /**
     * Update featured image
     * PATCH /blog-posts/{slug}/media/featured/
     */
    const updateFeaturedImage = useCallback(async (slug, imageFile, onProgress) => {
        if (!slug) return { success: false, error: "Invalid slug" };

        if (imageFile) {
            const validation = validateBlogImageFile(imageFile);
            if (!validation.valid) return { success: false, error: validation.error };
        }

        setUploading(true);

        try {
            const formData = new FormData();
            if (imageFile) formData.append("image", imageFile);

            const response = await adminApi.patch(
                `/blog-posts/${slug}/media/featured/`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (progressEvent) => {
                        if (onProgress && progressEvent.total) {
                            onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                        }
                    },
                }
            );

            setUploading(false);

            return { success: true, data: response };
        } catch (error) {
            setUploading(false);
            return { success: false, error: extractErrorMessage(error, "Failed to update featured image") };
        }
    }, []);

    /**
     * Delete featured image
     * DELETE /blog-posts/{slug}/media/featured/
     */
    const deleteFeaturedImage = useCallback(async (slug) => {
        if (!slug) return { success: false, error: "Invalid slug" };

        try {
            await adminApi.delete(`/blog-posts/${slug}/media/featured/`);
            return { success: true };
        } catch (error) {
            return { success: false, error: extractErrorMessage(error, "Failed to delete featured image") };
        }
    }, []);

    // ========================================
    // THUMBNAIL IMAGE OPERATIONS
    // ========================================

    /**
     * Upload thumbnail image
     * POST /blog-posts/{slug}/media/thumbnail/
     */
    const uploadThumbnailImage = useCallback(async (slug, imageFile, onProgress) => {
        if (!slug) return { success: false, error: "Invalid slug" };

        const validation = validateBlogImageFile(imageFile);
        if (!validation.valid) return { success: false, error: validation.error };

        setUploading(true);
        setProgress(0);

        let lastError = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                if (attempt > 0) {
                    console.log(`Retrying thumbnail upload (attempt ${attempt + 1}/${MAX_RETRIES + 1})...`);
                    await sleep(1000 * attempt);
                }

                const formData = new FormData();
                formData.append("images", imageFile);

                const response = await adminApi.post(
                    `/blog-posts/${slug}/media/thumbnail/`,
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                        onUploadProgress: (progressEvent) => {
                            if (progressEvent.total) {
                                const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                setProgress(pct);
                                if (onProgress) onProgress(pct);
                            }
                        },
                    }
                );

                setUploading(false);
                setProgress(100);

                return { success: true, data: response };
            } catch (error) {
                lastError = error;
                console.error(`Thumbnail upload attempt ${attempt + 1} failed:`, error);
            }
        }

        setUploading(false);
        return { success: false, error: extractErrorMessage(lastError, "Failed to upload thumbnail") };
    }, []);

    /**
     * Get thumbnail image
     * GET /blog-posts/{slug}/media/thumbnail/
     */
    const getThumbnailImage = useCallback(async (slug) => {
        if (!slug) return { success: false, error: "Invalid slug" };

        setLoading(true);

        try {
            const response = await adminApi.get(`/blog-posts/${slug}/media/thumbnail/`);
            setLoading(false);
            return { success: true, data: response };
        } catch (error) {
            setLoading(false);
            return { success: false, error: extractErrorMessage(error, "Failed to get thumbnail") };
        }
    }, []);

    /**
     * Update thumbnail image
     * PATCH /blog-posts/{slug}/media/thumbnail/
     */
    const updateThumbnailImage = useCallback(async (slug, imageFile, onProgress) => {
        if (!slug) return { success: false, error: "Invalid slug" };

        if (imageFile) {
            const validation = validateBlogImageFile(imageFile);
            if (!validation.valid) return { success: false, error: validation.error };
        }

        setUploading(true);

        try {
            const formData = new FormData();
            if (imageFile) formData.append("image", imageFile);

            const response = await adminApi.patch(
                `/blog-posts/${slug}/media/thumbnail/`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (progressEvent) => {
                        if (onProgress && progressEvent.total) {
                            onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                        }
                    },
                }
            );

            setUploading(false);

            return { success: true, data: response };
        } catch (error) {
            setUploading(false);
            return { success: false, error: extractErrorMessage(error, "Failed to update thumbnail") };
        }
    }, []);

    /**
     * Delete thumbnail image
     * DELETE /blog-posts/{slug}/media/thumbnail/
     */
    const deleteThumbnailImage = useCallback(async (slug) => {
        if (!slug) return { success: false, error: "Invalid slug" };

        try {
            await adminApi.delete(`/blog-posts/${slug}/media/thumbnail/`);
            return { success: true };
        } catch (error) {
            return { success: false, error: extractErrorMessage(error, "Failed to delete thumbnail") };
        }
    }, []);

    // ========================================
    // INLINE IMAGES OPERATIONS
    // ========================================

    /**
     * Upload inline images (multiple with metadata)
     * POST /blog-posts/{slug}/media/inline/
     */
    const uploadInlineImages = useCallback(async (slug, imageFiles, metadata = [], onProgress) => {
        if (!slug) return { success: false, error: "Invalid slug" };

        if (!imageFiles || imageFiles.length === 0) {
            return { success: false, error: "No files provided" };
        }

        if (imageFiles.length > MAX_INLINE_IMAGES) {
            return {
                success: false,
                error: `Maximum ${MAX_INLINE_IMAGES} inline images per upload. Got ${imageFiles.length}.`,
            };
        }

        // Validate all files
        for (let i = 0; i < imageFiles.length; i++) {
            const validation = validateBlogImageFile(imageFiles[i]);
            if (!validation.valid) {
                return { success: false, error: `File ${i + 1} (${imageFiles[i].name}): ${validation.error}` };
            }
        }

        setUploading(true);
        setProgress(0);

        let lastError = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                if (attempt > 0) {
                    console.log(`Retrying inline images upload (attempt ${attempt + 1}/${MAX_RETRIES + 1})...`);
                    await sleep(1000 * attempt);
                }

                const formData = new FormData();

                // Append all images with key 'images'
                imageFiles.forEach((file) => {
                    formData.append("images", file);
                });

                // Append metadata as JSON string if provided
                if (metadata.length > 0) {
                    formData.append("metadata", JSON.stringify(metadata));
                }

                const response = await adminApi.post(
                    `/blog-posts/${slug}/media/inline/`,
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                        onUploadProgress: (progressEvent) => {
                            if (progressEvent.total) {
                                const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                setProgress(pct);
                                if (onProgress) onProgress(pct);
                            }
                        },
                    }
                );

                setUploading(false);
                setProgress(100);

                return {
                    success: true,
                    data: response,
                    count: response?.uploaded || imageFiles.length,
                    items: response?.items || [],
                };
            } catch (error) {
                lastError = error;
                console.error(`Inline images upload attempt ${attempt + 1} failed:`, error);
            }
        }

        setUploading(false);
        return { success: false, error: extractErrorMessage(lastError, "Failed to upload inline images") };
    }, []);

    /**
     * Get single inline image
     * GET /blog-posts/{slug}/media/inline/{id}/
     */
    const getInlineImage = useCallback(async (slug, imageId) => {
        if (!slug || !imageId) return { success: false, error: "Invalid slug or image ID" };

        setLoading(true);

        try {
            const response = await adminApi.get(`/blog-posts/${slug}/media/inline/${imageId}/`);
            setLoading(false);
            return { success: true, data: response };
        } catch (error) {
            setLoading(false);
            return { success: false, error: extractErrorMessage(error, "Failed to get inline image") };
        }
    }, []);

    /**
     * Update inline image
     * PATCH /blog-posts/{slug}/media/inline/{id}/
     */
    const updateInlineImage = useCallback(async (slug, imageId, imageFile = null, metadata = {}, onProgress) => {
        if (!slug || !imageId) return { success: false, error: "Invalid slug or image ID" };

        if (imageFile) {
            const validation = validateBlogImageFile(imageFile);
            if (!validation.valid) return { success: false, error: validation.error };
        }

        setUploading(true);

        try {
            const formData = new FormData();

            if (imageFile) {
                formData.append("image", imageFile);
            }

            // Append metadata if provided
            if (Object.keys(metadata).length > 0) {
                formData.append("metadata", JSON.stringify([metadata]));
            }

            const response = await adminApi.patch(
                `/blog-posts/${slug}/media/inline/${imageId}/`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (progressEvent) => {
                        if (onProgress && progressEvent.total) {
                            onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                        }
                    },
                }
            );

            setUploading(false);

            return { success: true, data: response };
        } catch (error) {
            setUploading(false);
            return { success: false, error: extractErrorMessage(error, "Failed to update inline image") };
        }
    }, []);

    /**
     * Delete inline image
     * DELETE /blog-posts/{slug}/media/inline/{id}/
     */
    const deleteInlineImage = useCallback(async (slug, imageId) => {
        if (!slug || !imageId) return { success: false, error: "Invalid slug or image ID" };

        try {
            await adminApi.delete(`/blog-posts/${slug}/media/inline/${imageId}/`);
            return { success: true };
        } catch (error) {
            return { success: false, error: extractErrorMessage(error, "Failed to delete inline image") };
        }
    }, []);

    // ========================================
    // CONVENIENCE: FETCH ALL MEDIA FOR A POST
    // ========================================

    /**
     * Fetch all media (featured, thumbnail) for a blog post
     */
    const getBlogPostMedia = useCallback(async (slug) => {
        if (!slug) return { success: false, error: "Invalid slug" };

        setLoading(true);

        try {
            const [featuredResult, thumbnailResult] = await Promise.allSettled([
                getFeaturedImage(slug),
                getThumbnailImage(slug),
            ]);

            setLoading(false);

            return {
                success: true,
                featured: featuredResult.status === "fulfilled" ? featuredResult.value?.data : null,
                thumbnail: thumbnailResult.status === "fulfilled" ? thumbnailResult.value?.data : null,
            };
        } catch (error) {
            setLoading(false);
            return { success: false, error: extractErrorMessage(error, "Failed to fetch blog media") };
        }
    }, [getFeaturedImage, getThumbnailImage]);

    return {
        // State
        uploading,
        loading,
        progress,
        errors,
        clearErrors,

        // Featured image
        uploadFeaturedImage,
        getFeaturedImage,
        updateFeaturedImage,
        deleteFeaturedImage,

        // Thumbnail image
        uploadThumbnailImage,
        getThumbnailImage,
        updateThumbnailImage,
        deleteThumbnailImage,

        // Inline images
        uploadInlineImages,
        getInlineImage,
        updateInlineImage,
        deleteInlineImage,

        // Convenience
        getBlogPostMedia,

        // Validation utility
        validateImageFile: validateBlogImageFile,

        // Constants
        MAX_INLINE_IMAGES,
        MAX_FILE_SIZE_MB,
        SUPPORTED_FORMATS,
    };
};

export default useBlogImageUpload;