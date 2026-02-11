// src/pages/model/GalleryUpload.jsx
/**
 * Self-Contained Gallery Upload Component
 * 
 * Fetches treks from API and manages hero/gallery image uploads.
 * No external props needed - handles everything internally.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle, X, Info } from "lucide-react";
import TrekSelector from "./TrekSelector";
import ImageUploader from "./ImageUploader";
import ImagePreview from "./ImagePreviewer";
import  {useGalleryUpload } from "../hooks/useGalleryUpload";
import { getAdminTreks } from "../components/api/admin.api";

// Toast types (you can import from your constants file if available)
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

const GalleryUpload = ({ onViewList, showToast }) => {
  // Trek management state
  const [treks, setTreks] = useState([]);
  const [loadingTreks, setLoadingTreks] = useState(true);
  const [trekError, setTrekError] = useState(null);
  const [selectedTrek, setSelectedTrek] = useState(null);
  
  // Hero image state
  const [heroImage, setHeroImage] = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);
  
  // Gallery images state
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  
  // Upload state
  const [uploadState, setUploadState] = useState({
    hero: { uploading: false, progress: 0, error: null, success: false },
    gallery: { uploading: false, progress: 0, error: null, success: false },
  });
  
  // Debug mode
  const [debugMode, setDebugMode] = useState(false);

  const { 
    uploadHeroImage, 
    uploadGalleryImages,
    validateImageFile,
  } = useGalleryUpload();

  // ========================================
  // FETCH TREKS FROM API
  // ========================================
  useEffect(() => {
    async function fetchTreks() {
      setLoadingTreks(true);
      setTrekError(null);
      
      try {
        if (debugMode) {
          console.log('📡 Fetching treks from API...');
        }
        
        const response = await getAdminTreks();
        
        if (debugMode) {
          console.log('✅ Treks fetched:', response);
        }
        
        // Handle different response formats
        let treksList = [];
        
        if (Array.isArray(response)) {
          treksList = response;
        } else if (response.results && Array.isArray(response.results)) {
          treksList = response.results;
        } else if (response.treks && Array.isArray(response.treks)) {
          treksList = response.treks;
        } else if (response.data && Array.isArray(response.data)) {
          treksList = response.data;
        }
        
        if (debugMode) {
          console.log(`📊 Parsed ${treksList.length} treks`);
        }
        
        setTreks(treksList);
        
        if (treksList.length === 0) {
          console.warn('⚠️ No treks found in API response');
        }
      } catch (error) {
        console.error('❌ Failed to fetch treks:', error);
        setTrekError(
          error.message || 
          error.data?.detail || 
          'Failed to load treks from server'
        );
        
        if (showToast) {
          showToast(
            `Failed to load treks: ${error.message || 'Unknown error'}`,
            TOAST_TYPES.ERROR
          );
        }
      } finally {
        setLoadingTreks(false);
      }
    }
    
    fetchTreks();
  }, [debugMode, showToast]);

  // ========================================
  // PREVIEW MANAGEMENT
  // ========================================
  
  // Generate preview for hero image
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

  // Generate previews for gallery images
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

  // Reset form when trek changes
  useEffect(() => {
    resetForm();
  }, [selectedTrek]);

  // ========================================
  // FORM MANAGEMENT
  // ========================================
  
  const resetForm = () => {
    setHeroImage(null);
    setGalleryImages([]);
    setHeroPreview(null);
    setGalleryPreviews([]);
    setUploadState({
      hero: { uploading: false, progress: 0, error: null, success: false },
      gallery: { uploading: false, progress: 0, error: null, success: false },
    });
  };

  // ========================================
  // FILE SELECTION HANDLERS
  // ========================================
  
  // Handle hero image selection
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

  // Handle gallery images selection
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

    // Check max limit
    if (validFiles.length > 10) {
      if (showToast) {
        showToast("Maximum 10 gallery images allowed", TOAST_TYPES.WARNING);
      }
      validFiles.splice(10);
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
  };

  const handleRemoveGalleryImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  // ========================================
  // UPLOAD HANDLERS
  // ========================================
  
  // Upload hero image
  const handleUploadHero = async () => {
    if (!selectedTrek) {
      if (showToast) {
        showToast("Please select a trek first", TOAST_TYPES.ERROR);
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

    const result = await uploadHeroImage(
      selectedTrek.slug,
      heroImage,
      (progress) => {
        setUploadState(prev => ({
          ...prev,
          hero: { ...prev.hero, progress }
        }));
      },
      'treks' // type
    );

    if (result.success) {
      setUploadState(prev => ({
        ...prev,
        hero: { uploading: false, progress: 100, error: null, success: true }
      }));
      
      if (showToast) {
        showToast("Hero image uploaded successfully!", TOAST_TYPES.SUCCESS);
      }
      
      // Reset hero after 2 seconds
      setTimeout(() => {
        setHeroImage(null);
        setHeroPreview(null);
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
        showToast(`Failed to upload hero image: ${result.error}`, TOAST_TYPES.ERROR);
      }
    }
  };

  // Upload gallery images
  const handleUploadGallery = async () => {
    if (!selectedTrek) {
      if (showToast) {
        showToast("Please select a trek first", TOAST_TYPES.ERROR);
      }
      return;
    }

    if (galleryImages.length === 0) {
      if (showToast) {
        showToast("Please select gallery images", TOAST_TYPES.ERROR);
      }
      return;
    }

    setUploadState(prev => ({
      ...prev,
      gallery: { uploading: true, progress: 0, error: null, success: false }
    }));

    const result = await uploadGalleryImages(
      selectedTrek.slug,
      galleryImages,
      (progress) => {
        setUploadState(prev => ({
          ...prev,
          gallery: { ...prev.gallery, progress }
        }));
      },
      'treks' // type
    );

    if (result.success) {
      setUploadState(prev => ({
        ...prev,
        gallery: { uploading: false, progress: 100, error: null, success: true }
      }));
      
      if (showToast) {
        showToast(
          `Successfully uploaded ${result.count} gallery image(s)!`,
          TOAST_TYPES.SUCCESS
        );
      }
      
      // Reset gallery after 2 seconds
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
  // RENDER
  // ========================================
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Gallery & Hero Upload
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Upload hero image and gallery images for your treks
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Debug Toggle */}
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                debugMode 
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
        
        {debugMode && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 font-medium flex items-center gap-2">
              <Info className="w-4 h-4" />
              Debug mode enabled - Check browser console (F12) for detailed logs
            </p>
            <div className="mt-2 text-xs text-yellow-700 font-mono">
              <div>Treks loaded: {treks.length}</div>
              <div>Loading: {loadingTreks ? 'Yes' : 'No'}</div>
              <div>Error: {trekError || 'None'}</div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Trek Selection */}
        <TrekSelector
          treks={treks}
          selectedTrek={selectedTrek}
          onSelectTrek={setSelectedTrek}
          loading={loadingTreks}
          error={trekError}
        />

        {/* Upload Sections - Only show if trek is selected */}
        {selectedTrek && (
          <>
            {/* Hero Image Section */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                    Hero Image
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload a single hero image (max 5MB, recommended: 1920x1080px)
                  </p>
                </div>
              </div>

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
                  
                  {/* Debug info */}
                  {debugMode && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 font-mono">
                      <div>File: {heroImage.name}</div>
                      <div>Type: {heroImage.type}</div>
                      <div>Size: {(heroImage.size / 1024).toFixed(2)} KB</div>
                      <div>Preview: {heroPreview.substring(0, 50)}...</div>
                    </div>
                  )}
                </div>
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
                    <p className="text-sm text-green-700 mt-1">Hero image uploaded successfully</p>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploadState.hero.uploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Uploading...</span>
                    <span>{uploadState.hero.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 transition-all duration-300"
                      style={{ width: `${uploadState.hero.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="mt-4">
                <button
                  onClick={handleUploadHero}
                  disabled={!heroImage || uploadState.hero.uploading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {uploadState.hero.uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading Hero...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Hero Image
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Gallery Images Section */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-green-600" />
                    Gallery Images
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload up to 10 gallery images (max 5MB each, recommended: 1200x800px)
                  </p>
                </div>
              </div>

              <ImageUploader
                type="gallery"
                onFileSelect={handleGallerySelect}
                multiple={true}
                disabled={uploadState.gallery.uploading}
                maxFiles={10}
              />

              {galleryPreviews.length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                  <p className="mt-2 text-sm text-gray-500">
                    {galleryImages.length} / 10 images selected
                  </p>
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
                    <p className="text-sm text-green-700 mt-1">Gallery images uploaded successfully</p>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploadState.gallery.uploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Uploading...</span>
                    <span>{uploadState.gallery.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-600 h-2 transition-all duration-300"
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
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
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

        {!selectedTrek && !loadingTreks && !trekError && (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium">Select a Trek to Begin</p>
            <p className="text-sm mt-1">Choose a trek from the dropdown above to upload images</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryUpload;