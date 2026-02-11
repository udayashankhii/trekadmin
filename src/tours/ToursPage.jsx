// src/pages/ToursPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../treks/shared/Toast";
import ConfirmModal from "../treks/shared/ConfirmModal";
import TourList from "./TourList";
import TourBulkUpload from "./TourBulkUpload";
import TourDetailModal from "./TourDetailModal";
import GalleryUpload from "../gallery/GalleryUpload";
import { useTours } from "../hooks/tours/useTours";
import { useTourUpload } from "../hooks/tours/useTourUpload";
import { useToast } from "../hooks/useToast";
import { useDeleteTour } from "../hooks/tours/useDeleteTour";
import { useTourDetail } from "../hooks/tours/useTourDetail";
import { TOAST_TYPES } from "../components/utils/constants";

const ToursPage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("list");
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [viewModal, setViewModal] = useState({
    show: false,
    tour: null,
  });

  const { tours, loading, loadTours } = useTours();
  const { uploading, uploadProgress, uploadResults, upload, clearResults } = useTourUpload();
  const { toast, showToast, hideToast } = useToast();
  const { deleteTour, deleting } = useDeleteTour();
  const {
    tourData,
    loading: loadingDetail,
    error: detailError,
    loadTourDetail,
    clearTourDetail,
  } = useTourDetail();

  // Load tours on mount and when switching to list tab
  useEffect(() => {
    if (activeTab === "list") {
      loadToursWithToast();
    }
  }, [activeTab]);

  // Load tours with toast notification
  const loadToursWithToast = useCallback(async () => {
    const result = await loadTours();
    if (!result.success && result.error) {
      showToast("Failed to load tours", TOAST_TYPES.ERROR);
    }
  }, [loadTours, showToast]);

  // Handle bulk upload
  const handleBulkUpload = async (importData) => {
    const result = await upload(importData);

    // Normalize result to handle Tour importer format
    const successCount = (result.stats?.tours_created || 0) + (result.stats?.tours_updated || 0);
    const failCount = (result.errors || []).length;

    const isActuallySuccess = result.importOk !== undefined
      ? result.importOk && successCount > 0
      : result.success;

    if (isActuallySuccess && successCount > 0) {
      showToast(
        `Successfully uploaded ${successCount} tour(s)!`,
        TOAST_TYPES.SUCCESS
      );

      setTimeout(async () => {
        await loadTours();
      }, 500);
    } else if (result.error) {
      showToast(result.error, TOAST_TYPES.ERROR);
    } else if (successCount === 0 && failCount > 0) {
      showToast(
        `Upload failed: ${failCount} error(s)`,
        TOAST_TYPES.ERROR
      );
    } else if (successCount > 0 && failCount > 0) {
      showToast(
        `Uploaded ${successCount} tour(s). ${failCount} failed.`,
        TOAST_TYPES.WARNING
      );
      setTimeout(async () => {
        await loadTours();
      }, 500);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadTours().then((result) => {
      if (result.success) {
        showToast(
          `Loaded ${result.count} tours successfully`,
          TOAST_TYPES.SUCCESS
        );
      } else {
        showToast("Failed to load tours", TOAST_TYPES.ERROR);
      }
    });
  };

  // Handle add tour
  const handleAddTour = () => {
    setActiveTab("upload");
  };

  // Handle view list
  const handleViewList = async () => {
    setActiveTab("list");
    setTimeout(async () => {
      await loadTours();
    }, 200);
  };

  // Handle view tour details
  const handleView = async (tour) => {
    setViewModal({
      show: true,
      tour: tour,
    });

    const result = await loadTourDetail(tour.slug);

    if (!result.success) {
      showToast(
        `Failed to load tour details: ${result.error}`,
        TOAST_TYPES.ERROR
      );
    }
  };

  // Close view modal
  const handleCloseViewModal = () => {
    setViewModal({
      show: false,
      tour: null,
    });
    clearTourDetail();
  };

  // Handle edit tour - Navigate to edit page
  const handleEdit = (tour) => {
    navigate(`edit/${tour.slug}`);
  };

  // Handle delete tour
  const handleDelete = (tour) => {
    setConfirmModal({
      show: true,
      title: "Delete Tour",
      message: `Are you sure you want to delete "${tour.title}"? This action cannot be undone.`,
      onConfirm: async () => {
        showToast(`Deleting ${tour.title}...`, TOAST_TYPES.INFO);
        setConfirmModal({ ...confirmModal, show: false });

        const result = await deleteTour(tour.slug);

        if (result.success) {
          showToast(
            `Successfully deleted ${tour.title}`,
            TOAST_TYPES.SUCCESS
          );

          setTimeout(async () => {
            await loadTours();
          }, 300);
        } else {
          showToast(
            `Failed to delete ${tour.title}: ${result.error}`,
            TOAST_TYPES.ERROR
          );
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        {...confirmModal}
        onCancel={() => setConfirmModal({ ...confirmModal, show: false })}
      />

      {/* Tour Detail Modal */}
      <TourDetailModal
        isOpen={viewModal.show}
        onClose={handleCloseViewModal}
        tour={viewModal.tour || {}}
        tourData={tourData}
        loading={loadingDetail}
        error={detailError}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tour Management
          </h1>
          <p className="text-gray-600">
            Upload and manage your tours efficiently
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-6 py-3 font-medium transition-colors ${activeTab === "list"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Tour List ({tours.length})
            </button>

            <button
              onClick={() => setActiveTab("upload")}
              className={`px-6 py-3 font-medium transition-colors ${activeTab === "upload"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Bulk Upload
            </button>

            <button
              onClick={() => setActiveTab("gallery")}
              className={`px-6 py-3 font-medium transition-colors ${activeTab === "gallery"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Gallery Upload
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "list" && (
          <TourList
            tours={tours}
            loading={loading || deleting}
            onRefresh={handleRefresh}
            onAddTour={handleAddTour}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {activeTab === "upload" && (
          <TourBulkUpload
            uploading={uploading}
            uploadProgress={uploadProgress}
            uploadResults={uploadResults}
            onUpload={handleBulkUpload}
            onClearResults={clearResults}
            onViewList={handleViewList}
            showToast={showToast}
          />
        )}

        {activeTab === "gallery" && (
          <GalleryUpload
            type="tours"
            resources={tours}
            loading={loading}
            onViewList={handleViewList}
            showToast={showToast}
          />
        )}
      </div>
    </div>
  );
};

export default ToursPage;