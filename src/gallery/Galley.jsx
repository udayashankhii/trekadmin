// src/pages/model/TrekGalleryManager.jsx
/**
 * Comprehensive Trek Gallery Manager
 * 
 * This component demonstrates:
 * - Uploading hero images
 * - Uploading multiple gallery images
 * - Viewing uploaded images
 * - Deleting hero and gallery images
 * - Progress tracking and error handling
 */

import React, { useState, useEffect } from "react";
import { Upload, Image as ImageIcon, Trash2, X, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL || "http://localhost:8000/api/admin";

const TrekGalleryManager = ({ trek, onClose }) => {
  // Hero state
  const [heroFile, setHeroFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroProgress, setHeroProgress] = useState(0);
  
  // Gallery state
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryProgress, setGalleryProgress] = useState(0);
  
  // Existing images (from backend)
  const [existingHero, setExistingHero] = useState(null);
  const [existingGallery, setExistingGallery] = useState([]);
  
  // UI state
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      if (heroPreview) URL.revokeObjectURL(heroPreview);
      galleryPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [heroPreview, galleryPreviews]);

  // Generate preview for hero image
  useEffect(() => {
    if (heroFile) {
      const url = URL.createObjectURL(heroFile);
      setHeroPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setHeroPreview(null);
    }
  }, [heroFile]);

  // Generate previews for gallery images
  useEffect(() => {
    if (galleryFiles.length > 0) {
      const urls = galleryFiles.map(file => URL.createObjectURL(file));
      setGalleryPreviews(urls);
      return () => urls.forEach(url => URL.revokeObjectURL(url));
    } else {
      setGalleryPreviews([]);
    }
  }, [galleryFiles]);

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Handle hero file selection
  const handleHeroSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Hero image must be less than 5MB');
      return;
    }

    setHeroFile(file);
  };

  // Handle gallery files selection
  const handleGallerySelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = [];
    const errors = [];

    files.forEach((file, index) => {
      if (!file.type.startsWith('image/')) {
        errors.push(`File ${index + 1}: Not a valid image`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        errors.push(`File ${index + 1}: Exceeds 5MB`);
        return;
      }

      validFiles.push(file);
    });

    // Limit to 10
    if (validFiles.length > 10) {
      showMessage('error', 'Maximum 10 gallery images allowed');
      validFiles.splice(10);
    }

    if (errors.length > 0) {
      showMessage('error', `Some files were skipped: ${errors.join(', ')}`);
    }

    if (validFiles.length > 0) {
      setGalleryFiles(validFiles);
    }
  };

  // Upload hero image
  const uploadHero = async () => {
    if (!heroFile) {
      showMessage('error', 'Please select a hero image');
      return;
    }

    setHeroUploading(true);
    setHeroProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', heroFile);

      const response = await axios.post(
        `${API_BASE_URL}/treks/${trek.slug}/media/hero/`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setHeroProgress(percent);
            }
          },
        }
      );

      showMessage('success', 'Hero image uploaded successfully!');
      
      // Store the uploaded image info
      setExistingHero({
        url: response.data.hero_image_url,
      });

      // Clear the file selection
      setHeroFile(null);
      setHeroPreview(null);

    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to upload hero image';
      showMessage('error', errorMsg);
      console.error('Hero upload error:', error);
    } finally {
      setHeroUploading(false);
      setHeroProgress(0);
    }
  };

  // Upload gallery images
  const uploadGallery = async () => {
    if (galleryFiles.length === 0) {
      showMessage('error', 'Please select gallery images');
      return;
    }

    setGalleryUploading(true);
    setGalleryProgress(0);

    try {
      const formData = new FormData();
      
      // Append all files with key 'images' (Django expects this)
      galleryFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await axios.post(
        `${API_BASE_URL}/treks/${trek.slug}/media/gallery/`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setGalleryProgress(percent);
            }
          },
        }
      );

      showMessage('success', `Successfully uploaded ${response.data.uploaded} gallery image(s)!`);
      
      // Add newly uploaded images to existing gallery
      setExistingGallery(prev => [...prev, ...response.data.items]);

      // Clear the file selection
      setGalleryFiles([]);
      setGalleryPreviews([]);

    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to upload gallery images';
      showMessage('error', errorMsg);
      console.error('Gallery upload error:', error);
    } finally {
      setGalleryUploading(false);
      setGalleryProgress(0);
    }
  };

  // Delete hero image
  const deleteHero = async () => {
    if (!confirm('Are you sure you want to delete the hero image?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/treks/${trek.slug}/media/hero/`);
      showMessage('success', 'Hero image deleted successfully');
      setExistingHero(null);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to delete hero image';
      showMessage('error', errorMsg);
      console.error('Hero delete error:', error);
    }
  };

  // Delete gallery image
  const deleteGalleryImage = async (imageId) => {
    if (!confirm('Are you sure you want to delete this gallery image?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/treks/${trek.slug}/media/gallery/${imageId}/`);
      showMessage('success', 'Gallery image deleted successfully');
      setExistingGallery(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to delete gallery image';
      showMessage('error', errorMsg);
      console.error('Gallery delete error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Manage Gallery — {trek.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Upload hero and gallery images for this trek
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Message Banner */}
          {message && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          {/* Hero Image Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Hero Image</h3>
            </div>

            {/* Existing Hero */}
            {existingHero && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Hero:</p>
                <div className="relative inline-block">
                  <img 
                    src={existingHero.url} 
                    alt="Current Hero" 
                    className="w-64 h-36 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={deleteHero}
                    className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Upload New Hero */}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleHeroSelect}
                disabled={heroUploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
              
              {heroPreview && (
                <div className="mt-4">
                  <img 
                    src={heroPreview} 
                    alt="Preview" 
                    className="w-64 h-36 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {heroUploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Uploading...</span>
                    <span>{heroProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${heroProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={uploadHero}
                disabled={!heroFile || heroUploading}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {heroUploading ? 'Uploading...' : 'Upload Hero'}
              </button>
            </div>
          </div>

          {/* Gallery Images Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Gallery Images</h3>
              <span className="text-sm text-gray-500">(max 10)</span>
            </div>

            {/* Existing Gallery */}
            {existingGallery.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Current Gallery ({existingGallery.length} images):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {existingGallery.map((img) => (
                    <div key={img.id} className="relative group">
                      <img 
                        src={img.url} 
                        alt={img.alt_text || 'Gallery'} 
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => deleteGalleryImage(img.id)}
                        className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Gallery */}
            <div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGallerySelect}
                disabled={galleryUploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
              />

              {galleryPreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Selected: {galleryFiles.length} image(s)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {galleryPreviews.map((preview, index) => (
                      <img 
                        key={index}
                        src={preview} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}

              {galleryUploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Uploading...</span>
                    <span>{galleryProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${galleryProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={uploadGallery}
                disabled={galleryFiles.length === 0 || galleryUploading}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {galleryUploading ? 'Uploading...' : `Upload Gallery (${galleryFiles.length})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrekGalleryManager;