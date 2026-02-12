// src/gallery/GalleryUpload.jsx
/**
 * Universal Gallery Upload Component - PRODUCTION VERSION
 * 
 * Supports both treks and tours hero/gallery image uploads with full CRUD operations.
 * 
 * CRITICAL FIX:
 * - Properly handles response formats from public GET endpoints
 * - Hero image: data.imageUrl or data.image_url
 * - Gallery: array of images with image_url field
 * 
 * Features:
 * - View existing images
 * - Upload new images
 * - Update existing images (replace file or edit metadata)
 * - Delete images
 * - Progress tracking
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Info,
  Layers,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  X,
} from "lucide-react";
import ResourceSelector from "./ResourceSelector";
import ImageUploader from "./ImageUploader";
import ImagePreview from "./ImagePreviewer";
import { useGalleryUpload } from "../hooks/useGalleryUpload";
import { getAdminTreks } from "../components/api/admin.api";
import { getAdminToursList } from "../components/api/tours.api";

// Constants
const MAX_GALLERY_UPLOAD = 5;

const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

const GalleryUpload = ({ type = 'treks', onViewList, showToast }) => {
  // Resource management state
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [resourceError, setResourceError] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);

  // Hero image state
  const [heroImage, setHeroImage] = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);
  const [existingHero, setExistingHero] = useState(null);
  const [editingHero, setEditingHero] = useState(false);

  // Gallery images state
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);
  const [editingGalleryId, setEditingGalleryId] = useState(null);
  const [editingGalleryFile, setEditingGalleryFile] = useState(null);
  const [editingGalleryMetadata, setEditingGalleryMetadata] = useState({});

  // Upload state
  const [uploadState, setUploadState] = useState({
    hero: { uploading: false, progress: 0, error: null, success: false },
    gallery: { uploading: false, progress: 0, error: null, success: false },
  });

  // Debug
  const [debugMode, setDebugMode] = useState(false);

  const {
    uploadHeroImage,
    uploadGalleryImages,
    updateHeroImage,
    deleteHeroImage,
    updateGalleryImage,
    deleteGalleryImage,
    getHeroImage,
    getGalleryImages,
    validateImageFile,
    loading: fetchingImages,
  } = useGalleryUpload();

  // Derived labels
  const resourceLabel = useMemo(() => type === 'tours' ? 'Tour' : 'Trek', [type]);
  const resourceLabelPlural = useMemo(() => type === 'tours' ? 'Tours' : 'Treks', [type]);

  // ========================================
  // FETCH RESOURCES FROM API
  // ========================================
  useEffect(() => {
    async function fetchResources() {
      setLoadingResources(true);
      setResourceError(null);

      try {
        if (debugMode) {
          console.log(`📡 Fetching ${resourceLabelPlural} from API...`);
        }

        let response;
        if (type === 'tours') {
          response = await getAdminToursList();
        } else {
          response = await getAdminTreks();
        }

        if (debugMode) {
          console.log(`✅ ${resourceLabelPlural} fetched:`, response);
        }

        let resourceList = [];

        if (Array.isArray(response)) {
          resourceList = response;
        } else if (response?.results && Array.isArray(response.results)) {
          resourceList = response.results;
        } else if (response?.data && Array.isArray(response.data)) {
          resourceList = response.data;
        }

        if (debugMode) {
          console.log(`📊 Parsed ${resourceList.length} ${resourceLabelPlural.toLowerCase()}`);
        }

        setResources(resourceList);

        if (resourceList.length === 0) {
          console.warn(`⚠️ No ${resourceLabelPlural.toLowerCase()} found in API response`);
        }
      } catch (error) {
        console.error(`❌ Failed to fetch ${resourceLabelPlural.toLowerCase()}:`, error);
        setResourceError(
          error.message ||
          error.data?.detail ||
          `Failed to load ${resourceLabelPlural.toLowerCase()} from server`
        );

        if (showToast) {
          showToast(
            `Failed to load ${resourceLabelPlural.toLowerCase()}: ${error.message || 'Unknown error'}`,
            TOAST_TYPES.ERROR
          );
        }
      } finally {
        setLoadingResources(false);
      }
    }

    fetchResources();
  }, [type, debugMode, showToast, resourceLabelPlural]);

  // ========================================
  // FETCH EXISTING IMAGES WHEN RESOURCE SELECTED
  // ========================================
  useEffect(() => {
    if (!selectedResource) {
      setExistingHero(null);
      setExistingGallery([]);
      return;
    }

    async function loadExistingImages() {
      const slug = typeof selectedResource.slug === 'object'
        ? selectedResource.slug.slug || selectedResource.slug.value || ''
        : selectedResource.slug;

      if (!slug) return;

      try {
        // Fetch hero image
        const heroResult = await getHeroImage(slug, type);
        if (heroResult.success && heroResult.data) {
          // Extract image URL from response
          const imageUrl = heroResult.data.imageUrl || 
                          heroResult.data.image_url || 
                          heroResult.data.heroImage?.url ||
                          null;
          
          if (imageUrl) {
            setExistingHero({
              ...heroResult.data,
              url: imageUrl,
              imageUrl: imageUrl,
            });
            if (debugMode) {
              console.log('📸 Loaded hero image:', { url: imageUrl, data: heroResult.data });
            }
          }
        }

        // Fetch gallery images
        const galleryResult = await getGalleryImages(slug, type);
        if (galleryResult.success && galleryResult.data) {
          // Ensure each image has a proper URL
          const images = galleryResult.data.map(img => ({
            ...img,
            url: img.image_url || img.url,
          }));
          
          setExistingGallery(images);
          if (debugMode) {
            console.log('📸 Loaded gallery images:', images);
          }
        }
      } catch (error) {
        console.error('Error loading existing images:', error);
      }
    }

    loadExistingImages();
  }, [selectedResource, getHeroImage, getGalleryImages, type, debugMode]);

  // ========================================
  // PREVIEW MANAGEMENT
  // ========================================
  useEffect(() => {
    if (heroImage) {
      const url = URL.createObjectURL(heroImage);
      setHeroPreview(url);

      if (debugMode) {
        console.log('🖼️ Hero preview created:', {
          url,
          fileName: heroImage.name,
          fileType: heroImage.type,
          fileSize: heroImage.size,
        });
      }

      return () => {
        if (debugMode) console.log('🗑️ Revoking hero preview URL:', url);
        URL.revokeObjectURL(url);
      };
    } else {
      setHeroPreview(null);
    }
  }, [heroImage, debugMode]);

  useEffect(() => {
    if (galleryImages.length > 0) {
      const urls = galleryImages.map(file => {
        const url = URL.createObjectURL(file);
        if (debugMode) {
          console.log('🖼️ Gallery preview created:', {
            url,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          });
        }
        return url;
      });

      setGalleryPreviews(urls);

      return () => {
        if (debugMode) console.log('🗑️ Revoking gallery preview URLs');
        urls.forEach(url => URL.revokeObjectURL(url));
      };
    } else {
      setGalleryPreviews([]);
    }
  }, [galleryImages, debugMode]);

  // Reset form when resource changes
  useEffect(() => {
    resetForm();
  }, [selectedResource]);

  // ========================================
  // FORM MANAGEMENT
  // ========================================
  const resetForm = () => {
    setHeroImage(null);
    setGalleryImages([]);
    setHeroPreview(null);
    setGalleryPreviews([]);
    setEditingHero(false);
    setEditingGalleryId(null);
    setEditingGalleryFile(null);
    setEditingGalleryMetadata({});
    setUploadState({
      hero: { uploading: false, progress: 0, error: null, success: false },
      gallery: { uploading: false, progress: 0, error: null, success: false },
    });
  };

  // ========================================
  // FILE SELECTION HANDLERS
  // ========================================
  const handleHeroSelect = useCallback((files) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const validation = validateImageFile(file);

    if (!validation.valid) {
      if (showToast) {
        showToast(validation.error, TOAST_TYPES.ERROR);
      }
      return;
    }

    setHeroImage(file);
    setUploadState(prev => ({
      ...prev,
      hero: { uploading: false, progress: 0, error: null, success: false }
    }));
  }, [showToast, validateImageFile]);

  const handleGallerySelect = useCallback((files) => {
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

    if (validFiles.length > MAX_GALLERY_UPLOAD) {
      if (showToast) {
        showToast(
          `Maximum ${MAX_GALLERY_UPLOAD} gallery images allowed per upload. Only first ${MAX_GALLERY_UPLOAD} will be used.`,
          TOAST_TYPES.WARNING
        );
      }
      validFiles.splice(MAX_GALLERY_UPLOAD);
    }

    if (errors.length > 0 && showToast) {
      showToast(`Some files were skipped: ${errors.join(', ')}`, TOAST_TYPES.WARNING);
    }

    if (validFiles.length > 0) {
      setGalleryImages(validFiles);
      setUploadState(prev => ({
        ...prev,
        gallery: { uploading: false, progress: 0, error: null, success: false }
      }));
    }
  }, [showToast, validateImageFile]);

  // ========================================
  // REMOVE HANDLERS
  // ========================================
  const handleRemoveHero = () => {
    setHeroImage(null);
    setHeroPreview(null);
    setEditingHero(false);
  };

  const handleRemoveGalleryImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  // ========================================
  // UPLOAD HANDLERS
  // ========================================
  const handleUploadHero = async () => {
    if (!selectedResource) {
      if (showToast) {
        showToast(`Please select a ${resourceLabel.toLowerCase()} first`, TOAST_TYPES.ERROR);
      }
      return;
    }

    if (!heroImage) {
      if (showToast) {
        showToast("Please select a hero image", TOAST_TYPES.ERROR);
      }
      return;
    }

    setUploadState(prev => ({
      ...prev,
      hero: { uploading: true, progress: 0, error: null, success: false }
    }));

    const slug = typeof selectedResource.slug === 'object'
      ? selectedResource.slug.slug || selectedResource.slug.value || ''
      : selectedResource.slug;

    const result = editingHero
      ? await updateHeroImage(slug, heroImage, {}, (progress) => {
          setUploadState(prev => ({
            ...prev,
            hero: { ...prev.hero, progress }
          }));
        }, type)
      : await uploadHeroImage(slug, heroImage, (progress) => {
          setUploadState(prev => ({
            ...prev,
            hero: { ...prev.hero, progress }
          }));
        }, type);

    if (result.success) {
      setUploadState(prev => ({
        ...prev,
        hero: { uploading: false, progress: 100, error: null, success: true }
      }));

      if (showToast) {
        showToast(
          `${resourceLabel} hero image ${editingHero ? 'updated' : 'uploaded'} successfully!`,
          TOAST_TYPES.SUCCESS
        );
      }

      // Reload existing hero
      const heroResult = await getHeroImage(slug, type);
      if (heroResult.success && heroResult.data) {
        const imageUrl = heroResult.data.imageUrl || 
                        heroResult.data.image_url || 
                        heroResult.data.heroImage?.url ||
                        null;
        
        if (imageUrl) {
          setExistingHero({
            ...heroResult.data,
            url: imageUrl,
            imageUrl: imageUrl,
          });
        }
      }

      setTimeout(() => {
        setHeroImage(null);
        setHeroPreview(null);
        setEditingHero(false);
        setUploadState(prev => ({
          ...prev,
          hero: { uploading: false, progress: 0, error: null, success: false }
        }));
      }, 2000);
    } else {
      setUploadState(prev => ({
        ...prev,
        hero: { uploading: false, progress: 0, error: result.error, success: false }
      }));

      if (showToast) {
        showToast(`Failed to ${editingHero ? 'update' : 'upload'} hero image: ${result.error}`, TOAST_TYPES.ERROR);
      }
    }
  };

  const handleUploadGallery = async () => {
    if (!selectedResource) {
      if (showToast) {
        showToast(`Please select a ${resourceLabel.toLowerCase()} first`, TOAST_TYPES.ERROR);
      }
      return;
    }

    if (galleryImages.length === 0) {
      if (showToast) {
        showToast("Please select gallery images", TOAST_TYPES.ERROR);
      }
      return;
    }

    if (galleryImages.length > MAX_GALLERY_UPLOAD) {
      if (showToast) {
        showToast(
          `Maximum ${MAX_GALLERY_UPLOAD} images per upload. Please remove ${galleryImages.length - MAX_GALLERY_UPLOAD} image(s).`,
          TOAST_TYPES.ERROR
        );
      }
      return;
    }

    setUploadState(prev => ({
      ...prev,
      gallery: { uploading: true, progress: 0, error: null, success: false }
    }));

    const slug = typeof selectedResource.slug === 'object'
      ? selectedResource.slug.slug || selectedResource.slug.value || ''
      : selectedResource.slug;

    const result = await uploadGalleryImages(
      slug,
      galleryImages,
      (progress) => {
        setUploadState(prev => ({
          ...prev,
          gallery: { ...prev.gallery, progress }
        }));
      },
      type
    );

    if (result.success) {
      setUploadState(prev => ({
        ...prev,
        gallery: { uploading: false, progress: 100, error: null, success: true }
      }));

      if (showToast) {
        showToast(
          `Successfully uploaded ${result.count} gallery image(s) for ${resourceLabel.toLowerCase()}!`,
          TOAST_TYPES.SUCCESS
        );
      }

      // Reload existing gallery
      const galleryResult = await getGalleryImages(slug, type);
      if (galleryResult.success && galleryResult.data) {
        const images = galleryResult.data.map(img => ({
          ...img,
          url: img.image_url || img.url,
        }));
        setExistingGallery(images);
      }

      setTimeout(() => {
        setGalleryImages([]);
        setGalleryPreviews([]);
        setUploadState(prev => ({
          ...prev,
          gallery: { uploading: false, progress: 0, error: null, success: false }
        }));
      }, 2000);
    } else {
      setUploadState(prev => ({
        ...prev,
        gallery: { uploading: false, progress: 0, error: result.error, success: false }
      }));

      if (showToast) {
        showToast(`Failed to upload gallery images: ${result.error}`, TOAST_TYPES.ERROR);
      }
    }
  };

  // ========================================
  // DELETE HANDLERS
  // ========================================
  const handleDeleteHero = async () => {
    if (!selectedResource) return;

    const confirmed = window.confirm('Delete the hero image? This cannot be undone.');
    if (!confirmed) return;

    const slug = typeof selectedResource.slug === 'object'
      ? selectedResource.slug.slug || selectedResource.slug.value || ''
      : selectedResource.slug;

    const result = await deleteHeroImage(slug, type);

    if (result.success) {
      setExistingHero(null);
      if (showToast) {
        showToast('Hero image deleted successfully', TOAST_TYPES.SUCCESS);
      }
    } else {
      if (showToast) {
        showToast(`Failed to delete hero image: ${result.error}`, TOAST_TYPES.ERROR);
      }
    }
  };

  const handleDeleteGalleryImage = async (imageId) => {
    if (!selectedResource) return;

    const confirmed = window.confirm('Delete this gallery image? This cannot be undone.');
    if (!confirmed) return;

    const slug = typeof selectedResource.slug === 'object'
      ? selectedResource.slug.slug || selectedResource.slug.value || ''
      : selectedResource.slug;

    const result = await deleteGalleryImage(slug, imageId, type);

    if (result.success) {
      setExistingGallery(prev => prev.filter(img => img.id !== imageId));
      if (showToast) {
        showToast('Gallery image deleted successfully', TOAST_TYPES.SUCCESS);
      }
    } else {
      if (showToast) {
        showToast(`Failed to delete gallery image: ${result.error}`, TOAST_TYPES.ERROR);
      }
    }
  };

  // ========================================
  // EDIT HANDLERS
  // ========================================
  const handleEditHero = () => {
    setEditingHero(true);
    setHeroImage(null);
    setHeroPreview(null);
  };

  const handleCancelEditHero = () => {
    setEditingHero(false);
    setHeroImage(null);
    setHeroPreview(null);
  };

  const startEditGalleryImage = (image) => {
    setEditingGalleryId(image.id);
    setEditingGalleryMetadata({
      caption: image.caption || '',
      alt_text: image.altText || image.alt_text || image.alt || '',
      order: image.order || 0,
    });
  };

  const handleUpdateGalleryImage = async (imageId) => {
    if (!selectedResource) return;

    const slug = typeof selectedResource.slug === 'object'
      ? selectedResource.slug.slug || selectedResource.slug.value || ''
      : selectedResource.slug;

    const result = await updateGalleryImage(
      slug,
      imageId,
      editingGalleryFile,
      editingGalleryMetadata,
      null,
      type
    );

    if (result.success) {
      // Reload gallery
      const galleryResult = await getGalleryImages(slug, type);
      if (galleryResult.success && galleryResult.data) {
        const images = galleryResult.data.map(img => ({
          ...img,
          url: img.image_url || img.url,
        }));
        setExistingGallery(images);
      }

      setEditingGalleryId(null);
      setEditingGalleryFile(null);
      setEditingGalleryMetadata({});

      if (showToast) {
        showToast('Gallery image updated successfully', TOAST_TYPES.SUCCESS);
      }
    } else {
      if (showToast) {
        showToast(`Failed to update gallery image: ${result.error}`, TOAST_TYPES.ERROR);
      }
    }
  };

  const handleCancelEditGallery = () => {
    setEditingGalleryId(null);
    setEditingGalleryFile(null);
    setEditingGalleryMetadata({});
  };

  const handleRefreshImages = async () => {
    if (!selectedResource) return;

    const slug = typeof selectedResource.slug === 'object'
      ? selectedResource.slug.slug || selectedResource.slug.value || ''
      : selectedResource.slug;

    try {
      const heroResult = await getHeroImage(slug, type);
      if (heroResult.success && heroResult.data) {
        const imageUrl = heroResult.data.imageUrl || 
                        heroResult.data.image_url || 
                        heroResult.data.heroImage?.url ||
                        null;
        
        if (imageUrl) {
          setExistingHero({
            ...heroResult.data,
            url: imageUrl,
            imageUrl: imageUrl,
          });
        }
      }

      const galleryResult = await getGalleryImages(slug, type);
      if (galleryResult.success && galleryResult.data) {
        const images = galleryResult.data.map(img => ({
          ...img,
          url: img.image_url || img.url,
        }));
        setExistingGallery(images);
      }

      if (showToast) {
        showToast('Images refreshed successfully', TOAST_TYPES.SUCCESS);
      }
    } catch (error) {
      if (showToast) {
        showToast('Failed to refresh images', TOAST_TYPES.ERROR);
      }
    }
  };

  // ========================================
  // RENDER
  // ========================================
  const themeColor = type === 'tours' ? 'indigo' : 'blue';
  const galleryColor = 'emerald';

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Layers className={`w-5 h-5 text-${themeColor}-600`} />
              {resourceLabel} Gallery & Hero Upload
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Upload hero image and gallery images for your {resourceLabelPlural.toLowerCase()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedResource && (
              <button
                onClick={handleRefreshImages}
                disabled={fetchingImages}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-3 h-3 ${fetchingImages ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${debugMode
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              title="Toggle debug mode (check browser console)"
            >
              <Info className="w-3 h-3 inline mr-1" />
              Debug {debugMode ? 'ON' : 'OFF'}
            </button>

            {onViewList && (
              <button
                onClick={onViewList}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to List
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${themeColor}-100 text-${themeColor}-800`}>
            {resourceLabel} Mode
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            Max {MAX_GALLERY_UPLOAD} gallery images per upload
          </span>
        </div>

        {debugMode && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 font-medium flex items-center gap-2">
              <Info className="w-4 h-4" />
              Debug mode enabled - Check browser console (F12) for detailed logs
            </p>
            <div className="mt-2 text-xs text-yellow-700 font-mono">
              <div>Type: {type}</div>
              <div>{resourceLabelPlural} loaded: {resources.length}</div>
              <div>Loading: {loadingResources ? 'Yes' : 'No'}</div>
              <div>Error: {resourceError || 'None'}</div>
              <div>Selected: {selectedResource ? (selectedResource.name || selectedResource.title || selectedResource.slug) : 'None'}</div>
              <div>Existing hero: {existingHero?.url ? 'Yes' : 'No'}</div>
              <div>Existing gallery: {existingGallery.length} images</div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Resource Selection */}
        <ResourceSelector
          type={type}
          items={resources}
          selectedItem={selectedResource}
          onSelectItem={setSelectedResource}
          loading={loadingResources}
          error={resourceError}
        />

        {selectedResource && (
          <>
            {/* HERO IMAGE SECTION */}
            <div className={`border border-gray-200 rounded-lg p-6 transition-all duration-200 hover:border-${themeColor}-200`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ImageIcon className={`w-5 h-5 text-${themeColor}-600`} />
                    Hero Image
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload a single hero image for this {resourceLabel.toLowerCase()} (max 5MB, recommended: 1920×1080px)
                  </p>
                </div>
              </div>

              {/* Existing Hero Image */}
              {existingHero && existingHero.url && !editingHero && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Current Hero Image
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleEditHero}
                        className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" /> Replace
                      </button>
                      <button
                        onClick={handleDeleteHero}
                        className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                  <div className="aspect-video max-w-2xl rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={existingHero.url}
                      alt={existingHero.imageAlt || existingHero.alt || 'Hero image'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Failed to load hero image:', existingHero.url);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  {(existingHero.imageAlt || existingHero.imageCaption) && (
                    <div className="mt-2 text-xs text-gray-600">
                      {existingHero.imageAlt && <p>Alt: {existingHero.imageAlt}</p>}
                      {existingHero.imageCaption && <p>Caption: {existingHero.imageCaption}</p>}
                    </div>
                  )}
                </div>
              )}

              {editingHero && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <p className="text-sm text-blue-800">Editing mode: Select a new image to replace the existing hero</p>
                  <button
                    onClick={handleCancelEditHero}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Upload New Hero or show existing */}
              {(!existingHero || editingHero) && (
                <>
                  <ImageUploader
                    type="hero"
                    onFileSelect={handleHeroSelect}
                    multiple={false}
                    disabled={uploadState.hero.uploading}
                  />

                  {heroPreview && heroImage && (
                    <div className="mt-4">
                      <ImagePreview
                        image={heroImage}
                        preview={heroPreview}
                        onRemove={handleRemoveHero}
                        disabled={uploadState.hero.uploading}
                        objectFit="contain"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Upload Status */}
              {uploadState.hero.error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Upload Failed</p>
                    <p className="text-sm text-red-700 mt-1">{uploadState.hero.error}</p>
                  </div>
                </div>
              )}

              {uploadState.hero.success && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Upload Successful</p>
                    <p className="text-sm text-green-700 mt-1">{resourceLabel} hero image uploaded successfully</p>
                  </div>
                </div>
              )}

              {uploadState.hero.uploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Uploading hero image...</span>
                    <span>{uploadState.hero.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`bg-${themeColor}-600 h-2 transition-all duration-300`}
                      style={{ width: `${uploadState.hero.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              {(heroImage || editingHero) && (
                <div className="mt-4">
                  <button
                    onClick={handleUploadHero}
                    disabled={!heroImage || uploadState.hero.uploading}
                    className={`w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm`}
                  >
                    {uploadState.hero.uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {editingHero ? 'Updating' : 'Uploading'} Hero...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        {editingHero ? 'Update' : 'Upload'} Hero Image
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* GALLERY IMAGES SECTION */}
            <div className={`border border-gray-200 rounded-lg p-6 transition-all duration-200 hover:border-${galleryColor}-200`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-emerald-600" />
                    Gallery Images
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload up to {MAX_GALLERY_UPLOAD} gallery images at once (max 5MB each, recommended: 1200×800px)
                  </p>
                </div>
                {galleryImages.length > 0 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    {galleryImages.length} / {MAX_GALLERY_UPLOAD}
                  </span>
                )}
              </div>

              {/* Existing Gallery Images */}
              {existingGallery.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Current Gallery ({existingGallery.length} images)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {existingGallery.map((image) => {
                      const imageUrl = image.url;
                      const isEditing = editingGalleryId === image.id;

                      return (
                        <div key={image.id} className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          {/* Image */}
                          <div className="aspect-square">
                            <img
                              src={imageUrl}
                              alt={image.altText || image.alt_text || image.alt || 'Gallery image'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Failed to load gallery image:', imageUrl);
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                              }}
                            />
                          </div>

                          {/* Overlay with actions */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <button
                              onClick={() => startEditGalleryImage(image)}
                              className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                              title="Edit image"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGalleryImage(image.id)}
                              className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                              title="Delete image"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Image info */}
                          <div className="p-2 bg-white border-t border-gray-200">
                            <p className="text-xs text-gray-600 truncate">
                              {image.caption || image.title || 'No caption'}
                            </p>
                            <p className="text-xs text-gray-400">Order: {image.order}</p>
                          </div>

                          {/* Edit form */}
                          {isEditing && (
                            <div className="absolute inset-0 bg-white p-3 flex flex-col gap-2 z-10">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-semibold text-gray-800">Edit Image</p>
                                <button
                                  onClick={handleCancelEditGallery}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <input
                                type="text"
                                placeholder="Caption"
                                value={editingGalleryMetadata.caption || ''}
                                onChange={(e) => setEditingGalleryMetadata(prev => ({ ...prev, caption: e.target.value }))}
                                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-emerald-500"
                              />
                              <input
                                type="text"
                                placeholder="Alt text"
                                value={editingGalleryMetadata.alt_text || ''}
                                onChange={(e) => setEditingGalleryMetadata(prev => ({ ...prev, alt_text: e.target.value }))}
                                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-emerald-500"
                              />
                              <input
                                type="number"
                                placeholder="Order"
                                value={editingGalleryMetadata.order || 0}
                                onChange={(e) => setEditingGalleryMetadata(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-emerald-500"
                              />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setEditingGalleryFile(e.target.files?.[0] || null)}
                                className="text-xs"
                              />
                              <button
                                onClick={() => handleUpdateGalleryImage(image.id)}
                                className="w-full px-2 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-700 transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upload New Gallery Images */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Upload New Images</p>
                <ImageUploader
                  type="gallery"
                  onFileSelect={handleGallerySelect}
                  multiple={true}
                  disabled={uploadState.gallery.uploading}
                  maxFiles={MAX_GALLERY_UPLOAD}
                />
              </div>

              {galleryPreviews.length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {galleryPreviews.map((preview, index) => (
                      <ImagePreview
                        key={index}
                        image={galleryImages[index]}
                        preview={preview}
                        onRemove={() => handleRemoveGalleryImage(index)}
                        disabled={uploadState.gallery.uploading}
                        showSize={true}
                        objectFit="cover"
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {galleryImages.length} / {MAX_GALLERY_UPLOAD} images selected
                    </p>
                    {galleryImages.length >= MAX_GALLERY_UPLOAD && (
                      <p className="text-xs text-amber-600 font-medium">
                        Maximum upload limit reached
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Upload Status */}
              {uploadState.gallery.error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Upload Failed</p>
                    <p className="text-sm text-red-700 mt-1">{uploadState.gallery.error}</p>
                  </div>
                </div>
              )}

              {uploadState.gallery.success && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Upload Successful</p>
                    <p className="text-sm text-green-700 mt-1">Gallery images uploaded successfully for {resourceLabel.toLowerCase()}</p>
                  </div>
                </div>
              )}

              {uploadState.gallery.uploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Uploading {galleryImages.length} image(s)...</span>
                    <span>{uploadState.gallery.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 transition-all duration-300"
                      style={{ width: `${uploadState.gallery.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="mt-4">
                <button
                  onClick={handleUploadGallery}
                  disabled={galleryImages.length === 0 || uploadState.gallery.uploading}
                  className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                >
                  {uploadState.gallery.uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading Gallery...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Gallery Images ({galleryImages.length})
                    </span>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {!selectedResource && !loadingResources && !resourceError && (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium">Select a {resourceLabel} to Begin</p>
            <p className="text-sm mt-1">Choose a {resourceLabel.toLowerCase()} from the dropdown above to upload images</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryUpload;