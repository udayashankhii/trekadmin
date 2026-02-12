// src/gallery/BlogImageUpload.jsx
/**
 * BlogImageUpload Component
 *
 * Production-grade blog post media management component.
 * Supports featured image, thumbnail image, and inline (content) images.
 * Integrates all admin blog media APIs with the useBlogImageUpload hook.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Upload,
    Image as ImageIcon,
    AlertCircle,
    CheckCircle,
    Info,
    Layers,
    Star,
    Bookmark,
    FileImage,
    Trash2,
    RefreshCw,
    Eye,
} from "lucide-react";
import ImageUploader from "./ImageUploader";
import ImagePreview from "./ImagePreviewer";
import { useBlogImageUpload } from "../hooks/useBlogImageUpload";
import { getAdminBlogPosts } from "../components/api/admin.api";

// Constants
const MAX_INLINE_UPLOAD = 5;

const TOAST_TYPES = {
    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
};

/**
 * BlogPostSelector — lightweight dropdown to pick a blog post by slug
 */
const BlogPostSelector = ({ posts, selectedPost, onSelect, loading, error }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const filteredPosts = useMemo(() => {
        if (!searchTerm.trim()) return posts;
        const term = searchTerm.toLowerCase();
        return posts.filter(
            (p) =>
                (p.title || "").toLowerCase().includes(term) ||
                (p.slug || "").toLowerCase().includes(term) ||
                (p.category?.name || p.categorySlug || "").toLowerCase().includes(term)
        );
    }, [posts, searchTerm]);

    if (loading) {
        return (
            <div className="animate-pulse">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Blog Post</label>
                <div className="h-12 bg-gray-200 rounded-lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Blog Post</label>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-900">Failed to load blog posts</p>
                        <p className="text-sm text-red-700 mt-1">{typeof error === "string" ? error : "An error occurred"}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Blog Post</label>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-yellow-900">No blog posts available</p>
                        <p className="text-sm text-yellow-700 mt-1">Create blog posts before uploading images.</p>
                    </div>
                </div>
            </div>
        );
    }

    const selectedTitle = selectedPost?.title || selectedPost?.slug || "";

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Blog Post <span className="text-red-500">*</span>
            </label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            >
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        {selectedPost ? (
                            <div>
                                <p className="text-sm font-medium text-gray-900 truncate">{selectedTitle}</p>
                                <p className="text-xs text-gray-500 truncate">
                                    {selectedPost.slug}
                                    {selectedPost.status && ` • ${selectedPost.status}`}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Select a blog post...</p>
                        )}
                    </div>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute z-20 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden" style={{ maxHeight: "24rem" }}>
                        {/* Search */}
                        <div className="p-3 border-b border-gray-200 bg-gray-50">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search posts..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                autoFocus
                            />
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto" style={{ maxHeight: "18rem" }}>
                            {filteredPosts.length > 0 ? (
                                filteredPosts.map((post) => {
                                    const isSelected = selectedPost?.slug === post.slug;
                                    return (
                                        <button
                                            key={post.id || post.slug}
                                            type="button"
                                            onClick={() => {
                                                onSelect(post);
                                                setIsOpen(false);
                                                setSearchTerm("");
                                            }}
                                            className={`w-full px-4 py-3 text-left transition-colors ${isSelected ? "bg-violet-50 border-l-4 border-violet-600" : "hover:bg-gray-50"
                                                }`}
                                        >
                                            <p className="text-sm font-medium text-gray-900 truncate">{post.title || post.slug}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">{post.slug}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${post.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                    }`}>
                                                    {post.status || "draft"}
                                                </span>
                                                {post.category?.name && (
                                                    <span className="text-xs text-gray-500">• {post.category.name}</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    <p className="text-sm">No posts found</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {filteredPosts.length > 0 && (
                            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                    Showing {filteredPosts.length} of {posts.length} post(s)
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// ========================================
// MAIN COMPONENT
// ========================================

const BlogImageUpload = ({ showToast }) => {
    // Posts state
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [postsError, setPostsError] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);

    // Featured image state
    const [featuredImage, setFeaturedImage] = useState(null);
    const [featuredPreview, setFeaturedPreview] = useState(null);

    // Thumbnail image state
    const [thumbnailImage, setThumbnailImage] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    // Inline images state
    const [inlineImages, setInlineImages] = useState([]);
    const [inlinePreviews, setInlinePreviews] = useState([]);
    const [inlineMetadata, setInlineMetadata] = useState([]);

    // Existing media state (loaded from server)
    const [existingMedia, setExistingMedia] = useState({ featured: null, thumbnail: null });
    const [loadingMedia, setLoadingMedia] = useState(false);

    // Upload state
    const [uploadState, setUploadState] = useState({
        featured: { uploading: false, progress: 0, error: null, success: false },
        thumbnail: { uploading: false, progress: 0, error: null, success: false },
        inline: { uploading: false, progress: 0, error: null, success: false },
    });

    // Debug
    const [debugMode, setDebugMode] = useState(false);

    const {
        uploadFeaturedImage,
        uploadThumbnailImage,
        uploadInlineImages,
        deleteFeaturedImage,
        deleteThumbnailImage,
        getBlogPostMedia,
        validateImageFile,
        MAX_INLINE_IMAGES,
    } = useBlogImageUpload();

    // ========================================
    // FETCH BLOG POSTS
    // ========================================
    useEffect(() => {
        async function fetchPosts() {
            setLoadingPosts(true);
            setPostsError(null);

            try {
                const data = await getAdminBlogPosts();
                let postList = [];

                if (Array.isArray(data?.results)) {
                    postList = data.results;
                } else if (Array.isArray(data)) {
                    postList = data;
                }

                if (debugMode) console.log(`📊 Loaded ${postList.length} blog posts`);
                setPosts(postList);
            } catch (error) {
                console.error("❌ Failed to fetch blog posts:", error);
                setPostsError(error.message || "Failed to load blog posts");
                if (showToast) showToast("Failed to load blog posts", TOAST_TYPES.ERROR);
            } finally {
                setLoadingPosts(false);
            }
        }

        fetchPosts();
    }, [debugMode, showToast]);

    // ========================================
    // LOAD EXISTING MEDIA WHEN POST SELECTED
    // ========================================
    useEffect(() => {
        if (!selectedPost) {
            setExistingMedia({ featured: null, thumbnail: null });
            return;
        }

        async function loadMedia() {
            setLoadingMedia(true);
            try {
                const result = await getBlogPostMedia(selectedPost.slug);
                if (result.success) {
                    setExistingMedia({
                        featured: result.featured,
                        thumbnail: result.thumbnail,
                    });
                    if (debugMode) console.log("📸 Existing media loaded:", result);
                }
            } catch (error) {
                if (debugMode) console.error("Error loading existing media:", error);
            } finally {
                setLoadingMedia(false);
            }
        }

        loadMedia();
    }, [selectedPost, getBlogPostMedia, debugMode]);

    // ========================================
    // PREVIEW MANAGEMENT
    // ========================================
    useEffect(() => {
        if (featuredImage) {
            const url = URL.createObjectURL(featuredImage);
            setFeaturedPreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setFeaturedPreview(null);
        }
    }, [featuredImage]);

    useEffect(() => {
        if (thumbnailImage) {
            const url = URL.createObjectURL(thumbnailImage);
            setThumbnailPreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setThumbnailPreview(null);
        }
    }, [thumbnailImage]);

    useEffect(() => {
        if (inlineImages.length > 0) {
            const urls = inlineImages.map((file) => URL.createObjectURL(file));
            setInlinePreviews(urls);
            return () => urls.forEach((url) => URL.revokeObjectURL(url));
        } else {
            setInlinePreviews([]);
        }
    }, [inlineImages]);

    // Reset form when post changes
    useEffect(() => {
        resetForm();
    }, [selectedPost]);

    const resetForm = () => {
        setFeaturedImage(null);
        setThumbnailImage(null);
        setInlineImages([]);
        setInlineMetadata([]);
        setUploadState({
            featured: { uploading: false, progress: 0, error: null, success: false },
            thumbnail: { uploading: false, progress: 0, error: null, success: false },
            inline: { uploading: false, progress: 0, error: null, success: false },
        });
    };

    // ========================================
    // FILE SELECTION HANDLERS
    // ========================================
    const handleFeaturedSelect = useCallback(
        (files) => {
            if (!files || files.length === 0) return;
            const file = files[0];
            const validation = validateImageFile(file);
            if (!validation.valid) {
                if (showToast) showToast(validation.error, TOAST_TYPES.ERROR);
                return;
            }
            setFeaturedImage(file);
            setUploadState((prev) => ({
                ...prev,
                featured: { uploading: false, progress: 0, error: null, success: false },
            }));
        },
        [showToast, validateImageFile]
    );

    const handleThumbnailSelect = useCallback(
        (files) => {
            if (!files || files.length === 0) return;
            const file = files[0];
            const validation = validateImageFile(file);
            if (!validation.valid) {
                if (showToast) showToast(validation.error, TOAST_TYPES.ERROR);
                return;
            }
            setThumbnailImage(file);
            setUploadState((prev) => ({
                ...prev,
                thumbnail: { uploading: false, progress: 0, error: null, success: false },
            }));
        },
        [showToast, validateImageFile]
    );

    const handleInlineSelect = useCallback(
        (files) => {
            if (!files || files.length === 0) return;

            const validFiles = [];
            const errors = [];

            Array.from(files).forEach((file, index) => {
                const validation = validateImageFile(file);
                if (!validation.valid) {
                    errors.push(`File ${index + 1} (${file.name}): ${validation.error}`);
                    return;
                }
                validFiles.push(file);
            });

            if (validFiles.length > MAX_INLINE_UPLOAD) {
                if (showToast) {
                    showToast(
                        `Maximum ${MAX_INLINE_UPLOAD} inline images per upload. Only first ${MAX_INLINE_UPLOAD} used.`,
                        TOAST_TYPES.WARNING
                    );
                }
                validFiles.splice(MAX_INLINE_UPLOAD);
            }

            if (errors.length > 0 && showToast) {
                showToast(`Some files skipped: ${errors.join(", ")}`, TOAST_TYPES.WARNING);
            }

            if (validFiles.length > 0) {
                setInlineImages(validFiles);
                // Create empty metadata entries for each file
                setInlineMetadata(
                    validFiles.map((_, i) => ({
                        alt_text: "",
                        caption: "",
                        block_id: "",
                        order: i,
                    }))
                );
                setUploadState((prev) => ({
                    ...prev,
                    inline: { uploading: false, progress: 0, error: null, success: false },
                }));
            }
        },
        [showToast, validateImageFile]
    );

    // ========================================
    // METADATA HANDLERS
    // ========================================
    const updateInlineMetadataField = (index, field, value) => {
        setInlineMetadata((prev) => {
            const updated = [...prev];
            if (updated[index]) {
                updated[index] = { ...updated[index], [field]: value };
            }
            return updated;
        });
    };

    // ========================================
    // REMOVE HANDLERS
    // ========================================
    const handleRemoveInlineImage = (index) => {
        setInlineImages((prev) => prev.filter((_, i) => i !== index));
        setInlineMetadata((prev) => prev.filter((_, i) => i !== index));
    };

    // ========================================
    // UPLOAD HANDLERS
    // ========================================
    const handleUploadFeatured = async () => {
        if (!selectedPost) {
            if (showToast) showToast("Please select a blog post first", TOAST_TYPES.ERROR);
            return;
        }
        if (!featuredImage) {
            if (showToast) showToast("Please select a featured image", TOAST_TYPES.ERROR);
            return;
        }

        setUploadState((prev) => ({
            ...prev,
            featured: { uploading: true, progress: 0, error: null, success: false },
        }));

        const result = await uploadFeaturedImage(selectedPost.slug, featuredImage, (progress) => {
            setUploadState((prev) => ({
                ...prev,
                featured: { ...prev.featured, progress },
            }));
        });

        if (result.success) {
            setUploadState((prev) => ({
                ...prev,
                featured: { uploading: false, progress: 100, error: null, success: true },
            }));
            if (showToast) showToast("Featured image uploaded successfully!", TOAST_TYPES.SUCCESS);

            // Update existing media display
            setExistingMedia((prev) => ({ ...prev, featured: result.data }));

            setTimeout(() => {
                setFeaturedImage(null);
                setFeaturedPreview(null);
                setUploadState((prev) => ({
                    ...prev,
                    featured: { uploading: false, progress: 0, error: null, success: false },
                }));
            }, 2000);
        } else {
            setUploadState((prev) => ({
                ...prev,
                featured: { uploading: false, progress: 0, error: result.error, success: false },
            }));
            if (showToast) showToast(`Featured upload failed: ${result.error}`, TOAST_TYPES.ERROR);
        }
    };

    const handleUploadThumbnail = async () => {
        if (!selectedPost) {
            if (showToast) showToast("Please select a blog post first", TOAST_TYPES.ERROR);
            return;
        }
        if (!thumbnailImage) {
            if (showToast) showToast("Please select a thumbnail image", TOAST_TYPES.ERROR);
            return;
        }

        setUploadState((prev) => ({
            ...prev,
            thumbnail: { uploading: true, progress: 0, error: null, success: false },
        }));

        const result = await uploadThumbnailImage(selectedPost.slug, thumbnailImage, (progress) => {
            setUploadState((prev) => ({
                ...prev,
                thumbnail: { ...prev.thumbnail, progress },
            }));
        });

        if (result.success) {
            setUploadState((prev) => ({
                ...prev,
                thumbnail: { uploading: false, progress: 100, error: null, success: true },
            }));
            if (showToast) showToast("Thumbnail image uploaded successfully!", TOAST_TYPES.SUCCESS);

            setExistingMedia((prev) => ({ ...prev, thumbnail: result.data }));

            setTimeout(() => {
                setThumbnailImage(null);
                setThumbnailPreview(null);
                setUploadState((prev) => ({
                    ...prev,
                    thumbnail: { uploading: false, progress: 0, error: null, success: false },
                }));
            }, 2000);
        } else {
            setUploadState((prev) => ({
                ...prev,
                thumbnail: { uploading: false, progress: 0, error: result.error, success: false },
            }));
            if (showToast) showToast(`Thumbnail upload failed: ${result.error}`, TOAST_TYPES.ERROR);
        }
    };

    const handleUploadInline = async () => {
        if (!selectedPost) {
            if (showToast) showToast("Please select a blog post first", TOAST_TYPES.ERROR);
            return;
        }
        if (inlineImages.length === 0) {
            if (showToast) showToast("Please select inline images", TOAST_TYPES.ERROR);
            return;
        }

        setUploadState((prev) => ({
            ...prev,
            inline: { uploading: true, progress: 0, error: null, success: false },
        }));

        const result = await uploadInlineImages(
            selectedPost.slug,
            inlineImages,
            inlineMetadata,
            (progress) => {
                setUploadState((prev) => ({
                    ...prev,
                    inline: { ...prev.inline, progress },
                }));
            }
        );

        if (result.success) {
            setUploadState((prev) => ({
                ...prev,
                inline: { uploading: false, progress: 100, error: null, success: true },
            }));
            if (showToast) {
                showToast(
                    `Successfully uploaded ${result.count} inline image(s)!`,
                    TOAST_TYPES.SUCCESS
                );
            }

            setTimeout(() => {
                setInlineImages([]);
                setInlinePreviews([]);
                setInlineMetadata([]);
                setUploadState((prev) => ({
                    ...prev,
                    inline: { uploading: false, progress: 0, error: null, success: false },
                }));
            }, 2000);
        } else {
            setUploadState((prev) => ({
                ...prev,
                inline: { uploading: false, progress: 0, error: result.error, success: false },
            }));
            if (showToast) showToast(`Inline upload failed: ${result.error}`, TOAST_TYPES.ERROR);
        }
    };

    // ========================================
    // DELETE EXISTING MEDIA
    // ========================================
    const handleDeleteExistingFeatured = async () => {
        if (!selectedPost) return;
        const confirmed = window.confirm("Delete the existing featured image? This cannot be undone.");
        if (!confirmed) return;

        const result = await deleteFeaturedImage(selectedPost.slug);
        if (result.success) {
            setExistingMedia((prev) => ({ ...prev, featured: null }));
            if (showToast) showToast("Featured image deleted", TOAST_TYPES.SUCCESS);
        } else {
            if (showToast) showToast(`Delete failed: ${result.error}`, TOAST_TYPES.ERROR);
        }
    };

    const handleDeleteExistingThumbnail = async () => {
        if (!selectedPost) return;
        const confirmed = window.confirm("Delete the existing thumbnail image? This cannot be undone.");
        if (!confirmed) return;

        const result = await deleteThumbnailImage(selectedPost.slug);
        if (result.success) {
            setExistingMedia((prev) => ({ ...prev, thumbnail: null }));
            if (showToast) showToast("Thumbnail image deleted", TOAST_TYPES.SUCCESS);
        } else {
            if (showToast) showToast(`Delete failed: ${result.error}`, TOAST_TYPES.ERROR);
        }
    };

    // ========================================
    // RENDER HELPER — Status/Progress Bar
    // ========================================
    const renderUploadStatus = (type, label, color) => {
        const state = uploadState[type];
        return (
            <>
                {state.error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-900">Upload Failed</p>
                            <p className="text-sm text-red-700 mt-1">{state.error}</p>
                        </div>
                    </div>
                )}
                {state.success && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-green-900">Upload Successful</p>
                            <p className="text-sm text-green-700 mt-1">{label} uploaded successfully</p>
                        </div>
                    </div>
                )}
                {state.uploading && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                            <span>Uploading {label}...</span>
                            <span>{state.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className={`bg-${color}-600 h-2 transition-all duration-300`}
                                style={{ width: `${state.progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </>
        );
    };

    // ========================================
    // RENDER HELPER — Existing Media Card
    // ========================================
    const renderExistingMedia = (type, data, onDelete) => {
        const url = data?.url;
        if (!url) return null;

        return (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Current {type}
                    </p>
                    <button
                        onClick={onDelete}
                        className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                    >
                        <Trash2 className="w-3 h-3" /> Delete
                    </button>
                </div>
                <div className="aspect-video max-w-xs rounded-lg overflow-hidden border border-gray-200">
                    <img
                        src={url}
                        alt={data?.alt_text || type}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = "none";
                        }}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2 truncate font-mono">{url}</p>
            </div>
        );
    };

    // ========================================
    // MAIN RENDER
    // ========================================
    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-violet-600" />
                            Blog Post Media Upload
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Upload featured image, thumbnail, and inline content images for blog posts
                        </p>
                    </div>
                    <button
                        onClick={() => setDebugMode(!debugMode)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${debugMode
                                ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                                : "bg-gray-100 text-gray-600 border border-gray-300"
                            }`}
                    >
                        <Info className="w-3 h-3 inline mr-1" />
                        Debug {debugMode ? "ON" : "OFF"}
                    </button>
                </div>

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                        Blog Mode
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Max {MAX_INLINE_UPLOAD} inline images per upload
                    </span>
                </div>

                {debugMode && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-800 font-medium flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Debug mode — Check browser console (F12)
                        </p>
                        <div className="mt-2 text-xs text-yellow-700 font-mono">
                            <div>Posts loaded: {posts.length}</div>
                            <div>Selected: {selectedPost ? selectedPost.slug : "None"}</div>
                            <div>Featured: {existingMedia.featured?.url ? "Yes" : "None"}</div>
                            <div>Thumbnail: {existingMedia.thumbnail?.url ? "Yes" : "None"}</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 space-y-6">
                {/* Blog Post Selection */}
                <BlogPostSelector
                    posts={posts}
                    selectedPost={selectedPost}
                    onSelect={setSelectedPost}
                    loading={loadingPosts}
                    error={postsError}
                />

                {selectedPost && (
                    <>
                        {/* Loading existing media */}
                        {loadingMedia && (
                            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                                <p className="text-sm text-blue-700">Loading existing media...</p>
                            </div>
                        )}

                        {/* ===================== FEATURED IMAGE ===================== */}
                        <div className="border border-gray-200 rounded-lg p-6 transition-all duration-200 hover:border-violet-200">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Star className="w-5 h-5 text-violet-600" />
                                        Featured Image
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Main hero/featured image for this blog post (max 5MB, 1920×1080px recommended)
                                    </p>
                                </div>
                            </div>

                            {/* Existing featured image */}
                            {renderExistingMedia("Featured Image", existingMedia.featured, handleDeleteExistingFeatured)}

                            <div className="mt-4">
                                <ImageUploader
                                    type="hero"
                                    onFileSelect={handleFeaturedSelect}
                                    multiple={false}
                                    disabled={uploadState.featured.uploading}
                                />
                            </div>

                            {featuredPreview && featuredImage && (
                                <div className="mt-4">
                                    <ImagePreview
                                        image={featuredImage}
                                        preview={featuredPreview}
                                        onRemove={() => { setFeaturedImage(null); setFeaturedPreview(null); }}
                                        disabled={uploadState.featured.uploading}
                                        showSize={true}
                                        objectFit="contain"
                                    />
                                </div>
                            )}

                            {renderUploadStatus("featured", "Featured image", "violet")}

                            <div className="mt-4">
                                <button
                                    onClick={handleUploadFeatured}
                                    disabled={!featuredImage || uploadState.featured.uploading}
                                    className="w-full px-4 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                                >
                                    {uploadState.featured.uploading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Uploading Featured...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Upload className="w-4 h-4" />
                                            Upload Featured Image
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* ===================== THUMBNAIL IMAGE ===================== */}
                        <div className="border border-gray-200 rounded-lg p-6 transition-all duration-200 hover:border-sky-200">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Bookmark className="w-5 h-5 text-sky-600" />
                                        Thumbnail Image
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Card/listing thumbnail for blog previews (max 5MB, 600×400px recommended)
                                    </p>
                                </div>
                            </div>

                            {/* Existing thumbnail */}
                            {renderExistingMedia("Thumbnail", existingMedia.thumbnail, handleDeleteExistingThumbnail)}

                            <div className="mt-4">
                                <ImageUploader
                                    type="hero"
                                    onFileSelect={handleThumbnailSelect}
                                    multiple={false}
                                    disabled={uploadState.thumbnail.uploading}
                                />
                            </div>

                            {thumbnailPreview && thumbnailImage && (
                                <div className="mt-4">
                                    <ImagePreview
                                        image={thumbnailImage}
                                        preview={thumbnailPreview}
                                        onRemove={() => { setThumbnailImage(null); setThumbnailPreview(null); }}
                                        disabled={uploadState.thumbnail.uploading}
                                        showSize={true}
                                        objectFit="contain"
                                    />
                                </div>
                            )}

                            {renderUploadStatus("thumbnail", "Thumbnail image", "sky")}

                            <div className="mt-4">
                                <button
                                    onClick={handleUploadThumbnail}
                                    disabled={!thumbnailImage || uploadState.thumbnail.uploading}
                                    className="w-full px-4 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                                >
                                    {uploadState.thumbnail.uploading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Uploading Thumbnail...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Upload className="w-4 h-4" />
                                            Upload Thumbnail Image
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* ===================== INLINE IMAGES ===================== */}
                        <div className="border border-gray-200 rounded-lg p-6 transition-all duration-200 hover:border-emerald-200">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <FileImage className="w-5 h-5 text-emerald-600" />
                                        Inline / Content Images
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Upload up to {MAX_INLINE_UPLOAD} images for use within blog content (max 5MB each)
                                    </p>
                                </div>
                                {inlineImages.length > 0 && (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                        {inlineImages.length} / {MAX_INLINE_UPLOAD}
                                    </span>
                                )}
                            </div>

                            <ImageUploader
                                type="gallery"
                                onFileSelect={handleInlineSelect}
                                multiple={true}
                                disabled={uploadState.inline.uploading}
                                maxFiles={MAX_INLINE_UPLOAD}
                            />

                            {inlinePreviews.length > 0 && (
                                <div className="mt-4 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {inlinePreviews.map((preview, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                                <ImagePreview
                                                    image={inlineImages[index]}
                                                    preview={preview}
                                                    onRemove={() => handleRemoveInlineImage(index)}
                                                    disabled={uploadState.inline.uploading}
                                                    showSize={true}
                                                    objectFit="cover"
                                                />
                                                {/* Metadata inputs */}
                                                <div className="p-3 bg-gray-50 space-y-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Alt text"
                                                        value={inlineMetadata[index]?.alt_text || ""}
                                                        onChange={(e) => updateInlineMetadataField(index, "alt_text", e.target.value)}
                                                        disabled={uploadState.inline.uploading}
                                                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Caption"
                                                        value={inlineMetadata[index]?.caption || ""}
                                                        onChange={(e) => updateInlineMetadataField(index, "caption", e.target.value)}
                                                        disabled={uploadState.inline.uploading}
                                                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Block ID"
                                                            value={inlineMetadata[index]?.block_id || ""}
                                                            onChange={(e) => updateInlineMetadataField(index, "block_id", e.target.value)}
                                                            disabled={uploadState.inline.uploading}
                                                            className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="Order"
                                                            value={inlineMetadata[index]?.order ?? index}
                                                            onChange={(e) => updateInlineMetadataField(index, "order", parseInt(e.target.value) || 0)}
                                                            disabled={uploadState.inline.uploading}
                                                            className="w-16 px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-500">
                                            {inlineImages.length} / {MAX_INLINE_UPLOAD} images selected
                                        </p>
                                        {inlineImages.length >= MAX_INLINE_UPLOAD && (
                                            <p className="text-xs text-amber-600 font-medium">Maximum limit reached</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {renderUploadStatus("inline", "Inline images", "emerald")}

                            <div className="mt-4">
                                <button
                                    onClick={handleUploadInline}
                                    disabled={inlineImages.length === 0 || uploadState.inline.uploading}
                                    className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                                >
                                    {uploadState.inline.uploading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Uploading Inline Images...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Upload className="w-4 h-4" />
                                            Upload Inline Images ({inlineImages.length})
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Empty state */}
                {!selectedPost && !loadingPosts && !postsError && (
                    <div className="text-center py-12 text-gray-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-lg font-medium">Select a Blog Post to Begin</p>
                        <p className="text-sm mt-1">Choose a post from the dropdown above to upload media</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogImageUpload;
