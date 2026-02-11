// src/tours/model/TourEditPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileJson, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Toast from '../../treks/shared/Toast';
import { useTourDetail } from '../../hooks/tours/useTourDetail';
import { useTourEdit } from '../../hooks/tours/useTourEdit';
import { useToast } from '../../hooks/useToast';
import { TOAST_TYPES } from '../../components/utils/constants';
import JsonEditor from '../../treks/model/JSON.Editor';
import EditModeSelector from '../../treks/model/EditModeSelector';

const TourEditPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [editMode, setEditMode] = useState('partial');
    const [jsonData, setJsonData] = useState('');
    const [jsonError, setJsonError] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    const { tourData, loading, error, loadTourDetail } = useTourDetail();
    const { updateTour, updating } = useTourEdit();
    const { toast, showToast, hideToast } = useToast();

    // Load tour data on mount
    useEffect(() => {
        if (slug) {
            loadTourData();
        }
    }, [slug]);

    const loadTourData = async () => {
        const result = await loadTourDetail(slug);
        if (!result.success) {
            showToast(`Failed to load tour: ${result.error}`, TOAST_TYPES.ERROR);
        }
    };

    // Initialize JSON editor with tour data
    useEffect(() => {
        if (tourData && !hasChanges) {
            const formatted = formatTourForEdit(tourData, editMode);
            setJsonData(JSON.stringify(formatted, null, 2));
        }
    }, [tourData, editMode]);

    const formatTourForEdit = (tour, mode) => {
        if (mode === 'partial') {
            return {
                meta: {
                    schema_version: "1.0",
                    mode: "replace_nested"
                },
                tours: [
                    {
                        slug: tour.slug,
                        title: tour.title,
                        location: tour.location,
                        duration: tour.duration,
                        difficulty: tour.difficulty
                    }
                ]
            };
        } else {
            // Full export/import format
            return {
                meta: {
                    schema_version: "1.0",
                    mode: "replace_nested",
                    generated_by: "admin_panel",
                    generated_at: new Date().toISOString()
                },
                tours: [tour]
            };
        }
    };

    const handleJsonChange = useCallback((value) => {
        setJsonData(value);
        setHasChanges(true);

        try {
            JSON.parse(value);
            setJsonError(null);
        } catch (err) {
            setJsonError(err.message);
        }
    }, []);

    const handleSave = async () => {
        let parsedData;
        try {
            parsedData = JSON.parse(jsonData);
        } catch (err) {
            showToast(`Invalid JSON: ${err.message}`, TOAST_TYPES.ERROR);
            return;
        }

        if (!parsedData.tours || parsedData.tours.length === 0) {
            showToast('Tours array is required in the JSON payload', TOAST_TYPES.ERROR);
            return;
        }

        const method = editMode === 'partial' ? 'PATCH' : 'PUT';
        const result = await updateTour(slug, parsedData, method);

        if (result.success) {
            showToast('Tour updated successfully!', TOAST_TYPES.SUCCESS);
            setHasChanges(false);
            setTimeout(() => loadTourData(), 500);
        } else {
            showToast(result.error || 'Update failed', TOAST_TYPES.ERROR);
        }
    };

    const handleModeChange = (mode) => {
        if (hasChanges) {
            if (window.confirm('Switching modes will reset your changes. Continue?')) {
                setEditMode(mode);
                setHasChanges(false);
            }
        } else {
            setEditMode(mode);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/tours')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Tours
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Tour</h1>
                            <p className="text-gray-600">{tourData?.title || slug}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            {hasChanges && (
                                <span className="flex items-center gap-2 text-amber-600 text-sm font-medium">
                                    <AlertCircle className="w-4 h-4" />
                                    Unsaved changes
                                </span>
                            )}

                            <button
                                onClick={handleSave}
                                disabled={updating || !hasChanges || jsonError}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium shadow-sm"
                            >
                                {updating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading tour data...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 text-red-800">
                            <AlertCircle className="w-6 h-6" />
                            <div>
                                <h3 className="font-semibold">Failed to load tour</h3>
                                <p className="text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Editor */}
                {!loading && !error && tourData && (
                    <div className="space-y-6">
                        <EditModeSelector mode={editMode} onModeChange={handleModeChange} />

                        <JsonEditor
                            value={jsonData}
                            onChange={handleJsonChange}
                            error={jsonError}
                            mode={editMode}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <FileJson className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-semibold mb-1">
                                            {editMode === 'partial' ? 'Partial Edit (PATCH)' : 'Full Edit (PUT)'}
                                        </p>
                                        <p>
                                            {editMode === 'partial'
                                                ? 'Update specific fields. Other fields remain unchanged.'
                                                : 'Replace all tour data. Use with caution.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                    <div className="text-sm text-green-800">
                                        <p className="font-semibold mb-1">Tour Info</p>
                                        <p>Slug: <span className="font-mono">{tourData.slug}</span></p>
                                        <p>Location: {tourData.location || 'N/A'}</p>
                                        <p>Last updated: {tourData.updated_at ? new Date(tourData.updated_at).toLocaleString() : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TourEditPage;
