// // src/pages/admin/TreksPage.jsx
// import React, { useState, useEffect, useCallback, useRef } from "react";
// import {
//   Plus,
//   Filter,
//   Download,
//   MoreVertical,
//   UploadCloud,
//   FileJson,
//   Grid,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   Search,
//   Eye,
//   Edit,
//   Trash2,
//   RefreshCw,
//   X,
// } from "lucide-react";

// import {
//   getAdminTreks,
//   importFullTreksBulk,
// } from "../components/api/admin.api.js";

// // ============================================================================
// // CONSTANTS
// // ============================================================================

// const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
// const MAX_TREKS_PER_UPLOAD = 50;
// const TOAST_DURATION = 4000;

// const ALLOWED_FILE_TYPES = {
//   json: "application/json",
//   csv: "text/csv",
// };

// // Full import template matching your API structure
// const FULL_IMPORT_TEMPLATE = {
//   meta: {
//     schema_version: "1.0",
//     mode: "replace_nested",
//     generated_by: "admin_panel",
//     generated_at: new Date().toISOString(),
//   },
//   regions: [
//     {
//       name: "Everest",
//       slug: "everest",
//       short_label: "EBC, Gokyo, Three Passes",
//       order: 1,
//       marker_x: 50,
//       marker_y: 50,
//       cover_path: "",
//     },
//   ],
//   treks: [
//     {
//       slug: "everest-base-camp-trek",
//       title: "Everest Base Camp Trek",
//       region_slug: "everest",
//       duration: "14 Days",
//       trip_grade: "Moderate",
//       start_point: "Lukla",
//       group_size: "1-12",
//       max_altitude: "5364m",
//       activity: "Trekking",
//       review_text: "Classic trek to Everest Base Camp",
//       rating: 4.9,
//       reviews: 150,
//       hero_section: {
//         title: "Everest Base Camp Trek",
//         subtitle: "Journey to the base of the world's highest peak",
//         tagline: "EBC Trek",
//         cta_text: "Book Now",
//         cta_link: "/booking/everest-base-camp-trek",
//         image_path: "",
//       },
//       overview: {
//         sections: [
//           {
//             heading: "Trek Overview",
//             articles: [
//               "Experience the legendary trek to Everest Base Camp...",
//             ],
//             order: 1,
//             bullets: [
//               { text: "Max altitude 5364m", icon: "mountain", order: 1 },
//               {
//                 text: "Best seasons: Spring & Autumn",
//                 icon: "calendar",
//                 order: 2,
//               },
//             ],
//           },
//         ],
//       },
//       itinerary_days: [
//         {
//           day: 1,
//           title: "Arrival in Kathmandu",
//           description: "Welcome to Nepal",
//           accommodation: "Hotel",
//           altitude: "1400m",
//           duration: "",
//           distance: "",
//           meals: "Dinner",
//           place_name: "Kathmandu",
//           latitude: 27.7172,
//           longitude: 85.324,
//         },
//       ],
//       highlights: [
//         {
//           title: "Everest Views",
//           description: "Stunning views of Mt. Everest",
//           icon: "scenery",
//         },
//       ],
//       action: {
//         pdf_path: "",
//         map_image_path: "",
//       },
//       cost: {
//         title: "Cost Includes / Excludes",
//         cost_inclusions: ["Guide", "Permits", "Accommodation"],
//         cost_exclusions: ["International flights", "Personal expenses"],
//       },
//       cost_and_date_section: {
//         intro_text: "Choose your preferred departure dates",
//       },
//       departures: [
//         {
//           start: "2026-03-10",
//           end: "2026-03-23",
//           status: "Available",
//           price: 1299.0,
//           seats_left: 10,
//         },
//       ],
//       group_prices: [
//         { label: "1 Person", price: 1499.0 },
//         { label: "2-4 Person", price: 1299.0 },
//       ],
//       date_highlights: [{ highlight: "Best window: March–May" }],
//       faq_categories: [
//         {
//           title: "General",
//           icon: "general",
//           order: 1,
//           questions: [
//             {
//               question: "What is the best time to trek?",
//               answer: "Spring (March-May) and Autumn (September-November)",
//               order: 1,
//             },
//           ],
//         },
//       ],
//       gallery_images: [],
//       elevation_chart: {
//         title: "Elevation Profile",
//         subtitle: "Day-wise elevation changes",
//         background_image_path: "",
//         points: [],
//       },
//       booking_card: {
//         base_price: 1299.0,
//         original_price: 1499.0,
//         pricing_mode: "base_only",
//         badge_label: "Popular",
//         secure_payment: true,
//         no_hidden_fees: true,
//         free_cancellation: true,
//         support_24_7: true,
//         trusted_reviews: true,
//         group_prices: [
//           { min_size: 1, max_size: 1, price: 1499.0 },
//           { min_size: 2, max_size: 4, price: 1299.0 },
//         ],
//       },
//       additional_info_sections: [],
//       similar_treks: [],
//       reviews_list: [],
//     },
//   ],
// };

// // ============================================================================
// // TOAST COMPONENT
// // ============================================================================

// const Toast = ({ message, type = "success", show, onClose }) => {
//   useEffect(() => {
//     if (show) {
//       const timer = setTimeout(onClose, TOAST_DURATION);
//       return () => clearTimeout(timer);
//     }
//   }, [show, onClose]);

//   if (!show) return null;

//   const bgColor = {
//     success: "bg-green-600",
//     error: "bg-red-600",
//     warning: "bg-yellow-600",
//     info: "bg-blue-600",
//   }[type];

//   const Icon = {
//     success: CheckCircle,
//     error: XCircle,
//     warning: AlertCircle,
//     info: AlertCircle,
//   }[type];

//   return (
//     <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
//       <div
//         className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}
//       >
//         <Icon className="w-5 h-5 flex-shrink-0" />
//         <span className="flex-1">{message}</span>
//         <button
//           onClick={onClose}
//           className="hover:bg-white/20 rounded p-1 transition-colors"
//         >
//           <X className="w-4 h-4" />
//         </button>
//       </div>
//     </div>
//   );
// };

// // ============================================================================
// // CONFIRMATION MODAL
// // ============================================================================

// const ConfirmModal = ({ show, title, message, onConfirm, onCancel, type = "danger" }) => {
//   if (!show) return null;

//   const colors = {
//     danger: "bg-red-600 hover:bg-red-700",
//     warning: "bg-yellow-600 hover:bg-yellow-700",
//     info: "bg-blue-600 hover:bg-blue-700",
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg max-w-md w-full p-6 animate-scale-in">
//         <h3 className="text-xl font-bold mb-2">{title}</h3>
//         <p className="text-gray-600 mb-6">{message}</p>
//         <div className="flex gap-3 justify-end">
//           <button
//             onClick={onCancel}
//             className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             className={`px-4 py-2 text-white rounded-lg transition-colors ${colors[type]}`}
//           >
//             Confirm
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================================================
// // LOADING SPINNER
// // ============================================================================

// const LoadingSpinner = ({ size = "md" }) => {
//   const sizeClasses = {
//     sm: "h-4 w-4 border-2",
//     md: "h-8 w-8 border-2",
//     lg: "h-12 w-12 border-3",
//   };

//   return (
//     <div
//       className={`animate-spin rounded-full border-blue-600 border-t-transparent ${sizeClasses[size]}`}
//     />
//   );
// };

// // ============================================================================
// // MAIN COMPONENT
// // ============================================================================

// const TreksPage = () => {
//   // ========== STATE ==========
//   const [activeTab, setActiveTab] = useState("list");
//   const [treks, setTreks] = useState([]);
//   const [filteredTreks, setFilteredTreks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   // Upload states
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
//   const [uploadResults, setUploadResults] = useState([]);

//   // UI states
//   const [toast, setToast] = useState({ show: false, message: "", type: "success" });
//   const [confirmModal, setConfirmModal] = useState({ show: false, title: "", message: "", onConfirm: null });

//   // Refs
//   const jsonInputRef = useRef(null);
//   const csvInputRef = useRef(null);

//   // ========== TOAST HELPER ==========
//   const showToast = useCallback((message, type = "success") => {
//     setToast({ show: true, message, type });
//   }, []);

//   const hideToast = useCallback(() => {
//     setToast((prev) => ({ ...prev, show: false }));
//   }, []);

//   // ========== LOAD TREKS ==========
//   const loadTreks = useCallback(async () => {
//     setLoading(true);
//     try {
//       const data = await getAdminTreks();
//       const formatted = (Array.isArray(data) ? data : []).map((t) => ({
//         id: t.id,
//         name: t.title || "Untitled Trek",
//         slug: t.slug || "",
//         duration: t.duration || "N/A",
//         difficulty: t.trip_grade || "N/A",
//         price: t.base_price ? `$${parseFloat(t.base_price).toFixed(2)}` : "N/A",
//         region: t.region_name || "N/A",
//         bookings: t.bookings_count || "0",
//         status: t.is_published ? "Published" : "Draft",
//         rating: t.rating || "N/A",
//         maxAltitude: t.max_altitude || "N/A",
//       }));

//       setTreks(formatted);
//       setFilteredTreks(formatted);
//       showToast(`Loaded ${formatted.length} treks successfully`, "success");
//     } catch (error) {
//       console.error("Failed to load treks:", error);
//       showToast("Failed to load treks. Please try again.", "error");
//       setTreks([]);
//       setFilteredTreks([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [showToast]);

//   // ========== EFFECTS ==========
//   useEffect(() => {
//     if (activeTab === "list") {
//       loadTreks();
//     }
//   }, [activeTab, loadTreks]);

//   // Search filter
//   useEffect(() => {
//     if (!searchQuery.trim()) {
//       setFilteredTreks(treks);
//       return;
//     }

//     const query = searchQuery.toLowerCase();
//     const filtered = treks.filter(
//       (trek) =>
//         trek.name.toLowerCase().includes(query) ||
//         trek.slug.toLowerCase().includes(query) ||
//         trek.region.toLowerCase().includes(query) ||
//         trek.difficulty.toLowerCase().includes(query)
//     );
//     setFilteredTreks(filtered);
//   }, [searchQuery, treks]);

//   // ========== FILE VALIDATION ==========
//   const validateFile = (file, expectedType) => {
//     // Check file type
//     if (expectedType === "json" && file.type !== ALLOWED_FILE_TYPES.json) {
//       return { valid: false, error: "Please upload a valid JSON file (.json)" };
//     }

//     if (expectedType === "csv" && file.type !== ALLOWED_FILE_TYPES.csv) {
//       return { valid: false, error: "Please upload a valid CSV file (.csv)" };
//     }

//     // Check file size
//     if (file.size > MAX_FILE_SIZE) {
//       return {
//         valid: false,
//         error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
//       };
//     }

//     // Check if file is empty
//     if (file.size === 0) {
//       return { valid: false, error: "File is empty" };
//     }

//     return { valid: true };
//   };

//   // ========== BULK UPLOAD HANDLER ==========
//   const handleBulkUpload = async (importData) => {
//     setUploading(true);
//     setUploadResults([]);

//     try {
//       // Validate import data structure
//       if (!importData.meta || !importData.treks) {
//         throw new Error("Invalid import format. Missing 'meta' or 'treks' fields.");
//       }

//       const treksCount = Array.isArray(importData.treks) ? importData.treks.length : 0;

//       if (treksCount === 0) {
//         throw new Error("No treks found in the import data.");
//       }

//       if (treksCount > MAX_TREKS_PER_UPLOAD) {
//         throw new Error(`Cannot upload more than ${MAX_TREKS_PER_UPLOAD} treks at once.`);
//       }

//       setUploadProgress({ current: 0, total: treksCount });

//       // Call the bulk import API
//       const { results, stats, errors } = await importFullTreksBulk(
//         importData,
//         setUploadProgress
//       );

//       setUploadResults(results || []);

//       // Show summary
//       const successCount = results.filter((r) => r.success).length;
//       const failCount = results.length - successCount;

//       if (failCount === 0) {
//         showToast(`Successfully uploaded ${successCount} trek(s)!`, "success");
//       } else if (successCount === 0) {
//         showToast(`All ${failCount} trek(s) failed to upload.`, "error");
//       } else {
//         showToast(
//           `Uploaded ${successCount} trek(s). ${failCount} failed.`,
//           "warning"
//         );
//       }

//       // Refresh trek list after upload
//       if (successCount > 0) {
//         await loadTreks();
//       }

//       // Log stats and errors for debugging
//       if (stats) {
//         console.log("Upload stats:", stats);
//       }
//       if (errors && errors.length > 0) {
//         console.error("Upload errors:", errors);
//       }
//     } catch (error) {
//       console.error("Bulk upload error:", error);
//       showToast(error.message || "Upload failed. Please try again.", "error");
//     } finally {
//       setUploading(false);
//     }
//   };

//   // ========== JSON UPLOAD ==========
//   const handleJSONUpload = (event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const validation = validateFile(file, "json");
//     if (!validation.valid) {
//       showToast(validation.error, "error");
//       event.target.value = ""; // Reset input
//       return;
//     }

//     const reader = new FileReader();

//     reader.onload = async (e) => {
//       try {
//         const parsed = JSON.parse(e.target.result);
//         await handleBulkUpload(parsed);
//       } catch (error) {
//         console.error("JSON parse error:", error);
//         showToast(`Invalid JSON format: ${error.message}`, "error");
//       } finally {
//         event.target.value = ""; // Reset input for re-upload
//       }
//     };

//     reader.onerror = () => {
//       showToast("Failed to read file. Please try again.", "error");
//       event.target.value = "";
//     };

//     reader.readAsText(file);
//   };

//   // ========== CSV UPLOAD ==========
//   const handleCSVUpload = (event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const validation = validateFile(file, "csv");
//     if (!validation.valid) {
//       showToast(validation.error, "error");
//       event.target.value = "";
//       return;
//     }

//     showToast(
//       "CSV upload is not fully supported yet. Please use JSON format for full import.",
//       "warning"
//     );
//     event.target.value = "";

//     // TODO: Implement CSV parsing for full import structure
//     // This is complex because the full import format is deeply nested
//   };

//   // ========== TEMPLATE DOWNLOAD ==========
//   const downloadTemplate = (format) => {
//     try {
//       if (format === "json") {
//         const blob = new Blob([JSON.stringify(FULL_IMPORT_TEMPLATE, null, 2)], {
//           type: "application/json",
//         });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `trek-import-template-${Date.now()}.json`;
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         URL.revokeObjectURL(url);
//         showToast("Template downloaded successfully", "success");
//       } else if (format === "csv") {
//         showToast(
//           "CSV template not available. Please use JSON format for full import.",
//           "info"
//         );
//       }
//     } catch (error) {
//       console.error("Template download error:", error);
//       showToast("Failed to download template", "error");
//     }
//   };

//   // ========== CLEAR RESULTS ==========
//   const handleClearResults = () => {
//     setUploadResults([]);
//     setUploadProgress({ current: 0, total: 0 });
//   };

//   // ========== REFRESH TREKS ==========
//   const handleRefresh = () => {
//     loadTreks();
//   };

//   // ========== RENDER ==========
//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Toast Notification */}
//       <Toast
//         show={toast.show}
//         message={toast.message}
//         type={toast.type}
//         onClose={hideToast}
//       />

//       {/* Confirmation Modal */}
//       <ConfirmModal {...confirmModal} />

//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                 Trek Management
//               </h1>
//               <p className="text-gray-600">
//                 Upload and manage your treks efficiently
//               </p>
//             </div>

//             {activeTab === "list" && (
//               <button
//                 onClick={handleRefresh}
//                 disabled={loading}
//                 className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50"
//               >
//                 <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
//                 Refresh
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-white rounded-lg shadow-sm mb-6">
//           <div className="flex border-b">
//             <button
//               onClick={() => setActiveTab("list")}
//               className={`px-6 py-3 font-medium transition-colors ${
//                 activeTab === "list"
//                   ? "border-b-2 border-blue-600 text-blue-600"
//                   : "text-gray-600 hover:text-gray-900"
//               }`}
//             >
//               Trek List ({treks.length})
//             </button>

//             <button
//               onClick={() => setActiveTab("upload")}
//               className={`px-6 py-3 font-medium transition-colors ${
//                 activeTab === "upload"
//                   ? "border-b-2 border-blue-600 text-blue-600"
//                   : "text-gray-600 hover:text-gray-900"
//               }`}
//             >
//               Bulk Upload
//             </button>
//           </div>
//         </div>

//         {/* ===== TREK LIST TAB ===== */}
//         {activeTab === "list" && (
//           <div className="bg-white rounded-lg shadow-sm p-6">
//             {/* Search and Actions */}
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//               <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//                 <div className="relative flex-1 sm:flex-initial sm:w-80">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     type="text"
//                     placeholder="Search treks by name, region, difficulty..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>

//               <button
//                 onClick={() => setActiveTab("upload")}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
//               >
//                 <Plus className="w-4 h-4" /> Add Treks
//               </button>
//             </div>

//             {/* Loading State */}
//             {loading && (
//               <div className="flex flex-col items-center justify-center py-12">
//                 <LoadingSpinner size="lg" />
//                 <p className="mt-4 text-gray-600">Loading treks...</p>
//               </div>
//             )}

//             {/* Trek Table */}
//             {!loading && (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead className="bg-gray-50 border-b">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Trek Name
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Region
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Difficulty
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Duration
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Price
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Status
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>

//                   <tbody className="divide-y bg-white">
//                     {filteredTreks.length === 0 ? (
//                       <tr>
//                         <td colSpan={7} className="text-center py-12">
//                           <div className="flex flex-col items-center">
//                             <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
//                             <p className="text-gray-500 text-lg mb-2">
//                               {searchQuery
//                                 ? "No treks found matching your search"
//                                 : "No treks uploaded yet"}
//                             </p>
//                             {!searchQuery && (
//                               <button
//                                 onClick={() => setActiveTab("upload")}
//                                 className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                               >
//                                 Upload Your First Trek
//                               </button>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     ) : (
//                       filteredTreks.map((trek) => (
//                         <tr
//                           key={trek.id || trek.slug}
//                           className="hover:bg-gray-50 transition-colors"
//                         >
//                           <td className="px-6 py-4">
//                             <div>
//                               <div className="font-medium text-gray-900">
//                                 {trek.name}
//                               </div>
//                               <div className="text-sm text-gray-500">
//                                 {trek.slug}
//                               </div>
//                               {trek.rating !== "N/A" && (
//                                 <div className="text-xs text-gray-400 mt-1">
//                                   ⭐ {trek.rating}
//                                 </div>
//                               )}
//                             </div>
//                           </td>

//                           <td className="px-6 py-4 text-gray-900">
//                             {trek.region}
//                           </td>

//                           <td className="px-6 py-4">
//                             <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
//                               {trek.difficulty}
//                             </span>
//                           </td>

//                           <td className="px-6 py-4 text-gray-900">
//                             {trek.duration}
//                           </td>

//                           <td className="px-6 py-4 text-gray-900 font-medium">
//                             {trek.price}
//                           </td>

//                           <td className="px-6 py-4">
//                             <span
//                               className={`px-2 py-1 text-xs rounded-full ${
//                                 trek.status === "Published"
//                                   ? "bg-green-100 text-green-800"
//                                   : "bg-gray-100 text-gray-800"
//                               }`}
//                             >
//                               {trek.status}
//                             </span>
//                           </td>

//                           <td className="px-6 py-4">
//                             <div className="flex items-center gap-2">
//                               <button
//                                 className="text-blue-600 hover:text-blue-800 transition-colors"
//                                 title="View"
//                               >
//                                 <Eye className="w-4 h-4" />
//                               </button>
//                               <button
//                                 className="text-green-600 hover:text-green-800 transition-colors"
//                                 title="Edit"
//                               >
//                                 <Edit className="w-4 h-4" />
//                               </button>
//                               <button
//                                 className="text-red-600 hover:text-red-800 transition-colors"
//                                 title="Delete"
//                               >
//                                 <Trash2 className="w-4 h-4" />
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             {/* Results Summary */}
//             {!loading && filteredTreks.length > 0 && (
//               <div className="mt-4 flex items-center justify-between text-sm text-gray-600 border-t pt-4">
//                 <div>
//                   Showing {filteredTreks.length} of {treks.length} trek(s)
//                 </div>
//                 {searchQuery && (
//                   <button
//                     onClick={() => setSearchQuery("")}
//                     className="text-blue-600 hover:underline"
//                   >
//                     Clear Search
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {/* ===== BULK UPLOAD TAB ===== */}
//         {activeTab === "upload" && (
//           <div className="space-y-6">
//             {/* Upload Methods */}
//             <div className="grid md:grid-cols-2 gap-6">
//               {/* JSON Upload */}
//               <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
//                 <div className="text-center">
//                   <FileJson className="w-12 h-12 text-blue-600 mx-auto mb-4" />
//                   <h3 className="text-lg font-semibold mb-2">
//                     Upload JSON File
//                   </h3>
//                   <p className="text-gray-600 text-sm mb-4">
//                     Upload a JSON file with full trek import structure
//                   </p>

//                   <input
//                     ref={jsonInputRef}
//                     type="file"
//                     accept=".json"
//                     onChange={handleJSONUpload}
//                     className="hidden"
//                     id="json-upload"
//                     disabled={uploading}
//                   />

//                   <label
//                     htmlFor="json-upload"
//                     className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors ${
//                       uploading ? "opacity-50 cursor-not-allowed" : ""
//                     }`}
//                   >
//                     <UploadCloud className="w-4 h-4" />
//                     Choose JSON File
//                   </label>

//                   <div className="mt-4">
//                     <button
//                       onClick={() => downloadTemplate("json")}
//                       className="text-sm text-blue-600 hover:underline flex items-center gap-1 mx-auto"
//                     >
//                       <Download className="w-3 h-3" />
//                       Download JSON Template
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* CSV Upload (Limited Support) */}
//               <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-dashed border-gray-300 opacity-60">
//                 <div className="text-center">
//                   <Grid className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                   <h3 className="text-lg font-semibold mb-2 text-gray-600">
//                     CSV Upload
//                   </h3>
//                   <p className="text-gray-500 text-sm mb-4">
//                     CSV format not supported for full import structure
//                   </p>

//                   <button
//                     disabled
//                     className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
//                   >
//                     <UploadCloud className="w-4 h-4" />
//                     Not Available
//                   </button>

//                   <div className="mt-4">
//                     <p className="text-xs text-gray-500">
//                       Use JSON format for nested trek data
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Upload Progress */}
//             {uploading && (
//               <div className="bg-white rounded-lg shadow-sm p-6">
//                 <div className="flex items-center gap-3 mb-3">
//                   <LoadingSpinner size="sm" />
//                   <span className="font-medium">
//                     Uploading treks... {uploadProgress.current} of{" "}
//                     {uploadProgress.total}
//                   </span>
//                 </div>

//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div
//                     className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                     style={{
//                       width: `${
//                         uploadProgress.total === 0
//                           ? 0
//                           : (uploadProgress.current / uploadProgress.total) * 100
//                       }%`,
//                     }}
//                   ></div>
//                 </div>

//                 <p className="text-sm text-gray-600 mt-2">
//                   Please wait while your treks are being uploaded...
//                 </p>
//               </div>
//             )}

//             {/* Upload Results */}
//             {uploadResults.length > 0 && !uploading && (
//               <div className="bg-white rounded-lg shadow-sm p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-semibold">Upload Results</h3>
//                   <button
//                     onClick={handleClearResults}
//                     className="text-sm text-gray-600 hover:text-gray-900"
//                   >
//                     Clear Results
//                   </button>
//                 </div>

//                 <div className="space-y-2 max-h-96 overflow-y-auto">
//                   {uploadResults.map((result, i) => (
//                     <div
//                       key={i}
//                       className={`flex items-start gap-3 p-3 rounded-lg ${
//                         result.success ? "bg-green-50" : "bg-red-50"
//                       }`}
//                     >
//                       {result.success ? (
//                         <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
//                       ) : (
//                         <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//                       )}

//                       <div className="flex-1 min-w-0">
//                         <p
//                           className={`font-medium ${
//                             result.success ? "text-green-900" : "text-red-900"
//                           }`}
//                         >
//                           {result.trek || `Trek ${i + 1}`}
//                         </p>

//                         {!result.success && result.message && (
//                           <p className="text-sm text-red-700 mt-1 break-words">
//                             {result.message}
//                           </p>
//                         )}

//                         {result.success && result.message && (
//                           <p className="text-sm text-green-700 mt-1">
//                             {result.message}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Results Summary */}
//                 <div className="mt-4 pt-4 border-t flex justify-between items-center">
//                   <div className="text-sm">
//                     <span className="text-green-600 font-medium">
//                       {uploadResults.filter((r) => r.success).length} successful
//                     </span>
//                     <span className="text-gray-500 mx-2">•</span>
//                     <span className="text-red-600 font-medium">
//                       {uploadResults.filter((r) => !r.success).length} failed
//                     </span>
//                   </div>

//                   <button
//                     onClick={() => setActiveTab("list")}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
//                   >
//                     View Trek List
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Instructions */}
//             <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
//               <div className="flex gap-3">
//                 <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//                 <div>
//                   <h4 className="font-semibold text-blue-900 mb-2">
//                     Upload Instructions
//                   </h4>
//                   <ul className="text-sm text-blue-800 space-y-1">
//                     <li>
//                       • Download the JSON template to see the required nested structure
//                     </li>
//                     <li>
//                       • The template includes meta information, regions, and trek details
//                     </li>
//                     <li>
//                       • Fill in your trek data following the exact structure
//                     </li>
//                     <li>
//                       • Ensure all required fields are provided (slug, title, region_slug, etc.)
//                     </li>
//                     <li>
//                       • Upload the JSON file and wait for the process to complete
//                     </li>
//                     <li>
//                       • You can upload up to {MAX_TREKS_PER_UPLOAD} treks at once
//                     </li>
//                     <li>• Maximum file size: 5MB</li>
//                     <li>
//                       • Review results and fix any validation errors if needed
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             </div>

//             {/* Data Format Reference */}
//             <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
//               <h4 className="font-semibold text-gray-900 mb-3">
//                 Import Data Format
//               </h4>
//               <div className="bg-white rounded border border-gray-300 p-4 overflow-x-auto">
//                 <pre className="text-xs text-gray-700">
//                   {JSON.stringify(
//                     {
//                       meta: { schema_version: "1.0", mode: "replace_nested" },
//                       regions: [
//                         { name: "Region Name", slug: "region-slug", order: 1 },
//                       ],
//                       treks: [
//                         {
//                           slug: "trek-slug",
//                           title: "Trek Title",
//                           region_slug: "region-slug",
//                           duration: "10 Days",
//                           "...": "see template for full structure",
//                         },
//                       ],
//                     },
//                     null,
//                     2
//                   )}
//                 </pre>
//               </div>
//               <p className="text-sm text-gray-600 mt-2">
//                 Download the full template for complete field reference
//               </p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Custom CSS for animations */}

//     </div>
//   );
// };

// export default TreksPage;

import React, { useState, useEffect, useCallback } from "react";
import Toast from "./shared/Toast";
import ConfirmModal from "./shared/ConfirmModal";
import TrekList from "./model/TrekList";
import BulkUpload from "./model/BulkUpload";
import { useTreks } from "../hooks/useTreks";
import { useUpload } from "../hooks/useUpload";
import { useToast } from "../hooks/useToast";
import { useDeleteTrek } from "../hooks/useDeleteTrek"; // ⭐ NEW IMPORT
import { TOAST_TYPES } from "../components/utils/constants";

const TreksPage = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // Custom hooks
  const { treks, loading, loadTreks } = useTreks();
  const { uploading, uploadProgress, uploadResults, upload, clearResults } = useUpload();
  const { toast, showToast, hideToast } = useToast();
  const { deleteTrek, deleting } = useDeleteTrek(); // ⭐ NEW HOOK

  // Load treks on mount and when switching to list tab
  useEffect(() => {
    if (activeTab === "list") {
      loadTreksWithToast();
    }
  }, [activeTab]);

  // Load treks with toast notification
  const loadTreksWithToast = useCallback(async () => {
    const result = await loadTreks();
    if (result.success) {
      console.log(`✅ Loaded ${result.count} treks successfully`);
    } else {
      showToast("Failed to load treks", TOAST_TYPES.ERROR);
    }
  }, [loadTreks, showToast]);

  // Handle bulk upload
  const handleBulkUpload = async (importData) => {
    const result = await upload(importData);

    if (result.success) {
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
      if (failCount === 0) {
        showToast(
          `Successfully uploaded ${successCount} trek(s)!`,
          TOAST_TYPES.SUCCESS
        );
        setTimeout(async () => {
          await loadTreks();
        }, 500);
      } else if (successCount === 0) {
        showToast(`All ${failCount} trek(s) failed to upload.`, TOAST_TYPES.ERROR);
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

  // Action handlers
  const handleRefresh = () => {
    loadTreks().then((result) => {
      if (result.success) {
        showToast(`Loaded ${result.count} treks successfully`, TOAST_TYPES.SUCCESS);
      } else {
        showToast("Failed to load treks", TOAST_TYPES.ERROR);
      }
    });
  };

  const handleAddTrek = () => {
    setActiveTab("upload");
  };

  const handleViewList = async () => {
    setActiveTab("list");
    console.log("🔄 Switching to list tab, reloading treks...");
    setTimeout(async () => {
      await loadTreks();
    }, 200);
  };

  const handleView = (trek) => {
    showToast(`Viewing ${trek.name}`, TOAST_TYPES.INFO);
    // TODO: Implement view functionality
  };

  const handleEdit = (trek) => {
    showToast(`Editing ${trek.name}`, TOAST_TYPES.INFO);
    // TODO: Implement edit functionality
  };

  // ⭐ UPDATED DELETE HANDLER
  const handleDelete = (trek) => {
    setConfirmModal({
      show: true,
      title: "Delete Trek",
      message: `Are you sure you want to delete "${trek.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        // Show loading state
        showToast(`Deleting ${trek.name}...`, TOAST_TYPES.INFO);
        setConfirmModal({ ...confirmModal, show: false });

        // Call delete API
        const result = await deleteTrek(trek.slug);

        if (result.success) {
          showToast(`Successfully deleted ${trek.name}`, TOAST_TYPES.SUCCESS);
          
          // Reload treks after successful deletion
          console.log("🔄 Reloading treks after deletion...");
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
