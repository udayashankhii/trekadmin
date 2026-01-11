// src/components/utils/constants.js

export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
};
export const MAX_BLOGS_PER_UPLOAD = 200;
export const MAX_TREKS_PER_UPLOAD = 50; // Reasonable limit

export const API_ENDPOINTS = {
  TREKS_LIST: '/treks-list/',
  TREKS_SEARCH: '/treks/',
  IMPORT_FULL: '/import/full/',
};
