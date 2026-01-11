// src/pages/TreksPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "./shared/Toast";
import ConfirmModal from "./shared/ConfirmModal";
import TrekList from "./model/TrekList";
import BulkUpload from "./model/BulkUpload";
import TrekDetailModal from "./model/TrekDetailModal";
import { useTreks } from "../hooks/useTreks";
import { useUpload } from "../hooks/useUpload";
import { useToast } from "../hooks/useToast";
import { useDeleteTrek } from "../hooks/useDeleteTrek";
import { useTrekDetail } from "../hooks/useTrekDetail";
import { TOAST_TYPES } from "../components/utils/constants";

const TreksPage = () => {
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
    trek: null,
  });

  const { treks, loading, loadTreks } = useTreks();
  const { uploading, uploadProgress, uploadResults, upload, clearResults } = useUpload();
  const { toast, showToast, hideToast } = useToast();
  const { deleteTrek, deleting } = useDeleteTrek();
  const { 
    trekData, 
    loading: loadingDetail, 
    error: detailError, 
    loadTrekDetail, 
    clearTrekDetail 
  } = useTrekDetail();

  // Load treks on mount and when switching to list tab
  useEffect(() => {
    if (activeTab === "list") {
      loadTreksWithToast();
    }
  }, [activeTab]);

  // Load treks with toast notification
  const loadTreksWithToast = useCallback(async () => {
    const result = await loadTreks();
    if (!result.success && result.error) {
      showToast("Failed to load treks", TOAST_TYPES.ERROR);
    }
  }, [loadTreks, showToast]);

  // Handle bulk upload
  const handleBulkUpload = async (importData) => {
    const result = await upload(importData);

    const isActuallySuccess = result.importOk !== undefined 
      ? result.importOk && result.successCount > 0
      : result.success;

    if (isActuallySuccess && result.successCount > 0) {
      showToast(
        `Successfully uploaded ${result.successCount} trek(s)!`,
        TOAST_TYPES.SUCCESS
      );
      
      setTimeout(async () => {
        await loadTreks();
      }, 500);
      
    } else if (result.error) {
      showToast(result.error, TOAST_TYPES.ERROR);
    } else {
      const { successCount, failCount } = result;
      
      if (failCount === 0 && successCount > 0) {
        showToast(
          `Successfully uploaded ${successCount} trek(s)!`,
          TOAST_TYPES.SUCCESS
        );
        setTimeout(async () => {
          await loadTreks();
        }, 500);
      } else if (successCount === 0) {
        // Silent - already shown in upload component
      } else {
        showToast(
          `Uploaded ${successCount} trek(s). ${failCount} failed.`,
          TOAST_TYPES.WARNING
        );
        if (successCount > 0) {
          setTimeout(async () => {
            await loadTreks();
          }, 500);
        }
      }
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadTreks().then((result) => {
      if (result.success) {
        showToast(
          `Loaded ${result.count} treks successfully`, 
          TOAST_TYPES.SUCCESS
        );
      } else {
        showToast("Failed to load treks", TOAST_TYPES.ERROR);
      }
    });
  };

  // Handle add trek
  const handleAddTrek = () => {
    setActiveTab("upload");
  };

  // Handle view list
  const handleViewList = async () => {
    setActiveTab("list");
    setTimeout(async () => {
      await loadTreks();
    }, 200);
  };

  // Handle view trek details
  const handleView = async (trek) => {
    setViewModal({
      show: true,
      trek: trek,
    });

    const result = await loadTrekDetail(trek.slug);
    
    if (!result.success) {
      showToast(
        `Failed to load trek details: ${result.error}`,
        TOAST_TYPES.ERROR
      );
    }
  };

  // Close view modal
  const handleCloseViewModal = () => {
    setViewModal({
      show: false,
      trek: null,
    });
    clearTrekDetail();
  };

  // Handle edit trek - Navigate to edit page
const handleEdit = (trek) => {
  // Relative navigation works better with nested structure
  navigate(`edit/${trek.slug}`);
};


  // Handle delete trek
  const handleDelete = (trek) => {
    setConfirmModal({
      show: true,
      title: "Delete Trek",
      message: `Are you sure you want to delete "${trek.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        showToast(`Deleting ${trek.name}...`, TOAST_TYPES.INFO);
        setConfirmModal({ ...confirmModal, show: false });

        const result = await deleteTrek(trek.slug);

        if (result.success) {
          showToast(
            `Successfully deleted ${trek.name}`, 
            TOAST_TYPES.SUCCESS
          );
          
          setTimeout(async () => {
            await loadTreks();
          }, 300);
        } else {
          showToast(
            `Failed to delete ${trek.name}: ${result.error}`,
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

      {/* Trek Detail Modal */}
      <TrekDetailModal
        isOpen={viewModal.show}
        onClose={handleCloseViewModal}
        trek={viewModal.trek || {}}
        trekData={trekData}
        loading={loadingDetail}
        error={detailError}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Trek Management
          </h1>
          <p className="text-gray-600">
            Upload and manage your treks efficiently
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "list"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Trek List ({treks.length})
            </button>

            <button
              onClick={() => setActiveTab("upload")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "upload"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Bulk Upload
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "list" && (
          <TrekList
            treks={treks}
            loading={loading || deleting} 
            onRefresh={handleRefresh}
            onAddTrek={handleAddTrek}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {activeTab === "upload" && (
          <BulkUpload
            uploading={uploading}
            uploadProgress={uploadProgress}
            uploadResults={uploadResults}
            onUpload={handleBulkUpload}
            onClearResults={clearResults}
            onViewList={handleViewList}
            showToast={showToast}
          />
        )}
      </div>
    </div>
  );
};

export default TreksPage;
