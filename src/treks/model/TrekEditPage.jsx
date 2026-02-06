// src/treks/TrekEditPage.jsx


import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileJson, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Toast from '../shared/Toast';
import { useTrekDetail } from '../../hooks/useTrekDetail';
import { useTrekEdit } from '../../hooks/useEdit';
import { useToast } from '../../hooks/useToast';
import { TOAST_TYPES } from '../../components/utils/constants';
import JsonEditor from './JSON.Editor';
import EditModeSelector from './EditModeSelector';


const TrekEditPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [editMode, setEditMode] = useState('partial');
  const [jsonData, setJsonData] = useState('');
  const [jsonError, setJsonError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const { trekData, loading, error, loadTrekDetail } = useTrekDetail();
  const { updateTrek, updating } = useTrekEdit();
  const { toast, showToast, hideToast } = useToast();

  // Load trek data on mount
  useEffect(() => {
    console.log('✅ TrekEditPage mounted with slug:', slug);
    if (slug) {
      loadTrekData();
    }
  }, [slug]);

  // Initialize JSON editor with trek data
  useEffect(() => {
    if (trekData && !hasChanges) {
      console.log('📝 Formatting trek data for edit mode:', editMode);
      const formatted = formatTrekForEdit(trekData, editMode);
      setJsonData(JSON.stringify(formatted, null, 2));
    }
  }, [trekData, editMode]);

  const loadTrekData = async () => {
    console.log('🔄 Loading trek data for slug:', slug);
    const result = await loadTrekDetail(slug);
    if (!result.success) {
      showToast(`Failed to load trek: ${result.error}`, TOAST_TYPES.ERROR);
    } else {
      console.log('✅ Trek data loaded successfully');
    }
  };

const formatTrekForEdit = (trek, mode) => {
  // ✅ Helper to clean gallery images
  const cleanGalleryImages = (images) => {
    if (!Array.isArray(images)) return [];
    
    return images
      .filter(img => img && img.image_path && String(img.image_path).trim())
      .map((img, index) => ({
        image_path: String(img.image_path).trim(),
        title: img.title || "",
        caption: img.caption || "",
        order: typeof img.order === 'number' ? img.order : index,
      }));
  };

  if (mode === 'partial') {
    return {
      meta: {
        schema_version: "1.0",
        mode: "replace_nested"
      },
      treks: [
        {
          slug: trek.slug,
          title: trek.title,
          hero_section: trek.hero_section || {},
          overview: trek.overview || { sections: [] },
        }
      ]
    };
  } else {
    // ✅ Clean gallery images before sending
    const galleryImages = cleanGalleryImages(trek.gallery_images);

    return {
      meta: {
        schema_version: "1.0",
        mode: "replace_nested",
        generated_by: "admin_panel",
        generated_at: new Date().toISOString()
      },
      regions: [
        {
          name: trek.region?.name || "Unknown",
          slug: trek.region?.slug || "",
          short_label: "",
          order: 1,
          marker_x: 50,
          marker_y: 50,
          cover_path: ""
        }
      ],
      treks: [
        {
          slug: trek.slug,
          title: trek.title,
          region_slug: trek.region?.slug || "",
          duration: trek.duration || "",
          trip_grade: trek.trip_grade || trek.difficulty || "",
          start_point: trek.start_point || trek.startPoint || "",
          group_size: trek.group_size || trek.groupSize || "",
          max_altitude: trek.max_altitude || trek.maxAltitude || "",
          activity: trek.activity || "Trekking",
          review_text: trek.review_text || trek.reviewText || "",
          rating: trek.rating || 0,
          reviews: trek.reviews || 0,
          hero_section: trek.hero_section || {},
          overview: trek.overview || { sections: [] },
          itinerary_days: trek.itinerary_days || [],
          highlights: trek.highlights || [],
          action: trek.action || {},
          cost: trek.cost || {},
          cost_and_date_section: trek.cost_and_date_section || {},
          departures: trek.departures || [],
          group_prices: trek.group_prices || [],
          date_highlights: trek.date_highlights || [],
          faq_categories: trek.faq_categories || [],
          gallery_images: galleryImages, // ✅ Use cleaned array
          elevation_chart: trek.elevation_chart || {},
          booking_card: trek.booking_card || {},
          additional_info_sections: trek.additional_info_sections || [],
          similar_treks: trek.similar_treks || [],
          reviews_list: trek.reviews_list || []
        }
      ]
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
  console.log('💾 Attempting to save trek...');
  
  let parsedData;
  try {
    parsedData = JSON.parse(jsonData);
  } catch (err) {
    showToast(`Invalid JSON: ${err.message}`, TOAST_TYPES.ERROR);
    return;
  }

  if (!parsedData.treks || parsedData.treks.length === 0) {
    showToast('Treks array is required', TOAST_TYPES.ERROR);
    return;
  }

  // ✅ Validate gallery_images before sending
  const trek = parsedData.treks[0];
  if (Array.isArray(trek.gallery_images)) {
    const invalidImages = trek.gallery_images.filter(img => !img.image_path);
    if (invalidImages.length > 0) {
      showToast(
        `${invalidImages.length} gallery image(s) missing image_path. Please fix or remove them.`,
        TOAST_TYPES.ERROR
      );
      console.error('Invalid gallery images:', invalidImages);
      return;
    }
  }

  const method = editMode === 'partial' ? 'PATCH' : 'PUT';
  console.log(`📤 Sending ${method} request for slug:`, slug);
  console.log('📦 Payload:', JSON.stringify(parsedData, null, 2));
  
  const result = await updateTrek(slug, parsedData, method);

  if (result.success) {
    showToast(
      `Trek updated successfully! (${result.stats?.treks_updated || 0} treks updated)`,
      TOAST_TYPES.SUCCESS
    );
    setHasChanges(false);
    setTimeout(() => loadTrekData(), 500);
  } else {
    // ✅ Show detailed error information
    const errorDetails = result.errors?.map(e => e.error || e.message).join('; ') || result.error;
    showToast(`Update failed: ${errorDetails}`, TOAST_TYPES.ERROR);
    console.error('❌ Full error response:', result);
  }
};


  const handleBack = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/treks');
      }
    } else {
      navigate('/treks');
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
   

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Edit Trek
              </h1>
              <p className="text-gray-600">
                {trekData?.title || slug}
              </p>
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
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
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
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading trek data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Failed to load trek</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Editor */}
        {!loading && !error && trekData && (
          <div className="space-y-6">
            <EditModeSelector
              mode={editMode}
              onModeChange={handleModeChange}
            />

            <JsonEditor
              value={jsonData}
              onChange={handleJsonChange}
              error={jsonError}
              mode={editMode}
            />

            {/* Info Cards */}
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
                        ? 'Only the fields you include will be updated. Other fields remain unchanged.'
                        : 'All trek data will be replaced. Make sure to include all required fields.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-semibold mb-1">Trek Info</p>
                    <div className="space-y-1">
                      <p>Slug: <span className="font-mono">{trekData.slug}</span></p>
                      <p>Region: {trekData.region?.name || 'N/A'}</p>
                      <p>Last updated: {trekData.updated_at ? new Date(trekData.updated_at).toLocaleString() : 'N/A'}</p>
                    </div>
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

export default TrekEditPage;
