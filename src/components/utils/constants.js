// // src/components/utils/constants.js

// export const TOAST_TYPES = {
//   SUCCESS: 'success',
//   ERROR: 'error',
//   WARNING: 'warning',
//   INFO: 'info',
// };

export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
};
export const MAX_BLOGS_PER_UPLOAD = 200;
// export const MAX_TREKS_PER_UPLOAD = 50; // Reasonable limit

// export const API_ENDPOINTS = {
//   TREKS_LIST: '/treks-list/',
//   TREKS_SEARCH: '/treks/',
//   IMPORT_FULL: '/import/full/',
// };
// export const MAX_TOURS_PER_UPLOAD = 100;



// src/components/utils/constants.js

// ============================================================================
// UPLOAD LIMITS
// ============================================================================
export const MAX_TOURS_PER_UPLOAD = 50;
export const MAX_TREKS_PER_UPLOAD = 50;
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ============================================================================
// TOAST TYPES
// ============================================================================
export const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

// ============================================================================
// API ENDPOINTS
// ============================================================================
export const API_ENDPOINTS = {
  // Tours
  TOURS_LIST: "/api/admin/tours/",
  TOURS_DETAIL: (slug) => `/api/admin/tours/${slug}/`,
  TOURS_FULL: (slug) => `/api/admin/tours/${slug}/full/`,
  TOURS_IMPORT: "/api/admin/tours/import/full/",
  
  // Treks
  TREKS_LIST: "/api/admin/treks/",
  TREKS_DETAIL: (slug) => `/api/admin/treks/${slug}/`,
  TREKS_FULL: (slug) => `/api/admin/treks/${slug}/full/`,
  TREKS_IMPORT: "/api/admin/treks/import/full/",
};

// ============================================================================
// TOUR CONSTANTS
// ============================================================================
export const TOUR_DIFFICULTY_LEVELS = [
  { value: "Easy", label: "Easy", color: "green" },
  { value: "Moderate", label: "Moderate", color: "yellow" },
  { value: "Challenging", label: "Challenging", color: "orange" },
  { value: "Difficult", label: "Difficult", color: "red" },
  { value: "Extreme", label: "Extreme", color: "purple" },
];

export const TOUR_ACTIVITY_TYPES = [
  "Trekking",
  "Sightseeing",
  "Cultural Exploration",
  "Wildlife Safari",
  "Pilgrimage",
  "Adventure Sports",
  "Nature & Relaxation",
  "Photography",
  "Cycling",
  "Rafting",
  "Climbing",
  "Other",
];

export const TRAVEL_STYLE_CATEGORIES = [
  { slug: "adventure-sports", name: "Adventure Sports" },
  { slug: "cultural-immersion", name: "Cultural Immersion" },
  { slug: "wildlife-adventure", name: "Wildlife Adventure" },
  { slug: "spiritual-wellness", name: "Spiritual & Wellness" },
  { slug: "nature-wildlife", name: "Nature & Wildlife" },
  { slug: "leisure-relaxation", name: "Leisure & Relaxation" },
  { slug: "heritage-exploration", name: "Heritage Exploration" },
  { slug: "family-friendly", name: "Family Friendly" },
  { slug: "luxury-travel", name: "Luxury Travel" },
  { slug: "budget-travel", name: "Budget Travel" },
];

// ============================================================================
// TREK CONSTANTS
// ============================================================================
export const TREK_GRADE_LEVELS = [
  { value: "Easy", label: "Easy", color: "green" },
  { value: "Moderate", label: "Moderate", color: "yellow" },
  { value: "Challenging", label: "Challenging", color: "orange" },
  { value: "Strenuous", label: "Strenuous", color: "red" },
  { value: "Extreme", label: "Extreme", color: "purple" },
];

export const TREK_REGIONS = [
  "Everest",
  "Annapurna",
  "Langtang",
  "Manaslu",
  "Mustang",
  "Dolpo",
  "Kanchenjunga",
  "Makalu",
  "Other",
];

// ============================================================================
// PAGINATION
// ============================================================================
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ============================================================================
// DATE FORMATS
// ============================================================================
export const DATE_FORMAT = "YYYY-MM-DD";
export const DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
export const DISPLAY_DATE_FORMAT = "MMM DD, YYYY";
export const DISPLAY_DATETIME_FORMAT = "MMM DD, YYYY HH:mm";

// ============================================================================
// VALIDATION RULES
// ============================================================================
export const VALIDATION = {
  SLUG: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 120,
    PATTERN: /^[a-z0-9-]+$/,
    MESSAGE: "Slug must be lowercase letters, numbers, and hyphens only",
  },
  TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 300,
    MESSAGE: "Title must be between 5 and 300 characters",
  },
  DESCRIPTION: {
    MIN_LENGTH: 20,
    MAX_LENGTH: 5000,
    MESSAGE: "Description must be between 20 and 5000 characters",
  },
  PRICE: {
    MIN: 0,
    MAX: 999999,
    MESSAGE: "Price must be a positive number",
  },
  GROUP_SIZE: {
    MIN: 1,
    MAX: 100,
    MESSAGE: "Group size must be between 1 and 100",
  },
};

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================
export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  USER_DATA: "userData",
  THEME: "theme",
  LANGUAGE: "language",
  RECENT_TOURS: "recentTours",
  RECENT_TREKS: "recentTreks",
};

// ============================================================================
// STATUS CONSTANTS
// ============================================================================
export const PUBLISH_STATUS = {
  PUBLISHED: { value: true, label: "Published", color: "green" },
  DRAFT: { value: false, label: "Draft", color: "gray" },
};

// ============================================================================
// SORT OPTIONS
// ============================================================================
export const SORT_OPTIONS = {
  CREATED_DESC: { value: "-created_at", label: "Newest First" },
  CREATED_ASC: { value: "created_at", label: "Oldest First" },
  TITLE_ASC: { value: "title", label: "Title (A-Z)" },
  TITLE_DESC: { value: "-title", label: "Title (Z-A)" },
  RATING_DESC: { value: "-rating", label: "Highest Rated" },
  RATING_ASC: { value: "rating", label: "Lowest Rated" },
  PRICE_DESC: { value: "-price", label: "Highest Price" },
  PRICE_ASC: { value: "price", label: "Lowest Price" },
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your internet connection.",
  UNAUTHORIZED: "You are not authorized. Please login again.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  UPLOAD_FAILED: "Upload failed. Please try again.",
  DELETE_FAILED: "Delete failed. Please try again.",
  UPDATE_FAILED: "Update failed. Please try again.",
};

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================
export const SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: "Upload completed successfully!",
  DELETE_SUCCESS: "Deleted successfully!",
  UPDATE_SUCCESS: "Updated successfully!",
  CREATE_SUCCESS: "Created successfully!",
  SAVE_SUCCESS: "Saved successfully!",
};

// ============================================================================
// ICONS (Lucide React icon names)
// ============================================================================
export const ICONS = {
  TOUR: "MapPin",
  TREK: "Mountain",
  UPLOAD: "Upload",
  DOWNLOAD: "Download",
  EDIT: "Edit",
  DELETE: "Trash2",
  VIEW: "Eye",
  ADD: "Plus",
  SEARCH: "Search",
  FILTER: "Filter",
  SORT: "ArrowUpDown",
  REFRESH: "RefreshCw",
  CLOSE: "X",
  CHECK: "Check",
  WARNING: "AlertTriangle",
  ERROR: "AlertCircle",
  INFO: "Info",
  SUCCESS: "CheckCircle",
};

export default {
  MAX_TOURS_PER_UPLOAD,
  MAX_TREKS_PER_UPLOAD,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
  TOAST_TYPES,
  API_ENDPOINTS,
  TOUR_DIFFICULTY_LEVELS,
  TOUR_ACTIVITY_TYPES,
  TRAVEL_STYLE_CATEGORIES,
  TREK_GRADE_LEVELS,
  TREK_REGIONS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  DATE_FORMAT,
  DATETIME_FORMAT,
  DISPLAY_DATE_FORMAT,
  DISPLAY_DATETIME_FORMAT,
  VALIDATION,
  STORAGE_KEYS,
  PUBLISH_STATUS,
  SORT_OPTIONS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ICONS,
};