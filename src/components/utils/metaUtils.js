// src/components/utils/metaUtils.js

/**
 * Dedicated utilities for meta management
 */

/**
 * Create a complete meta object with all required fields
 */
export function createCompleteMeta(options = {}) {
  const now = new Date().toISOString();

  return {
    // Core metadata
    schema_version: options.schema_version || '2.0',
    format: options.format || 'trek_import',
    mode: options.mode || 'replace_nested',

    // Generation info
    generated_by: options.generated_by || 'admin_panel',
    generated_at: options.generated_at || now,
    generator_version: options.generator_version || '1.0.0',

    // Data statistics (will be calculated)
    counts: options.counts || {
      regions: 0,
      treks: 0,
      total_itinerary_days: 0,
      total_highlights: 0,
      total_faqs: 0,
      total_gallery_images: 0,
      total_departures: 0
    },

    // Validation rules
    validation: {
      strict_mode: false,
      allow_partial_import: true,
      skip_missing_images: true,
      validate_slugs: true,
      required_fields: ['slug', 'title', 'region_slug'],
      ...options.validation
    },

    // Import options
    options: {
      overwrite_existing: true,
      create_missing_regions: false,
      preserve_reviews: true,
      preserve_bookings: true,
      update_timestamps: true,
      ...options.options
    },

    // Source information
    source: {
      type: 'manual_upload',
      origin: 'trek_admin_panel',
      environment: process.env.NODE_ENV || 'production',
      user: 'admin',
      notes: '',
      ...options.source
    },

    // Processing instructions
    processing: {
      batch_size: 10,
      timeout_seconds: 300,
      retry_failed: true,
      max_retries: 3,
      ...options.processing
    }
  };
}

/**
 * Supported import modes
 */
export const IMPORT_MODES = {
  REPLACE_NESTED: 'replace_nested',
  MERGE: 'merge',
  APPEND: 'append'
};

/**
 * Supported source types
 */
export const SOURCE_TYPES = {
  MANUAL_UPLOAD: 'manual_upload',
  API: 'api',
  MIGRATION: 'migration',
  BACKUP: 'backup',
  AUTOMATED: 'automated'
};

/**
 * Supported environments
 */
export const ENVIRONMENTS = {
  PRODUCTION: 'production',
  STAGING: 'staging',
  DEVELOPMENT: 'development',
  TEST: 'test'
};

/**
 * Validate import mode
 */
export function isValidMode(mode) {
  return Object.values(IMPORT_MODES).includes(mode);
}

/**
 * Validate source type
 */
export function isValidSourceType(type) {
  return Object.values(SOURCE_TYPES).includes(type);
}

/**
 * Validate environment
 */
export function isValidEnvironment(env) {
  return Object.values(ENVIRONMENTS).includes(env);
}

/**
 * Get human-readable description of import mode
 */
export function getModeDescription(mode) {
  const descriptions = {
    [IMPORT_MODES.REPLACE_NESTED]: 'Replace existing nested data (itinerary, highlights, etc.)',
    [IMPORT_MODES.MERGE]: 'Merge with existing data (combine both)',
    [IMPORT_MODES.APPEND]: 'Append new data only (skip existing)'
  };
  return descriptions[mode] || 'Unknown mode';
}

/**
 * Export meta utilities
 */
export default {
  createCompleteMeta,
  IMPORT_MODES,
  SOURCE_TYPES,
  ENVIRONMENTS,
  isValidMode,
  isValidSourceType,
  isValidEnvironment,
  getModeDescription
};