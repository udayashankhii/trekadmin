// src/components/utils/fileValidation.js

import { normalizeImportPayload } from './schemaMapper';

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  json: 10 * 1024 * 1024, // 10MB
  csv: 5 * 1024 * 1024,   // 5MB
};

// Allowed MIME types
export const ALLOWED_MIME_TYPES = {
  json: ['application/json', 'text/json', ''],
  csv: ['text/csv', 'application/csv', 'text/comma-separated-values'],
};

/**
 * Validate file before processing
 */
export function validateFile(file, type) {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  const maxSize = FILE_SIZE_LIMITS[type];
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return { 
      valid: false, 
      error: `File too large (${fileSizeMB}MB). Maximum size is ${maxSizeMB}MB` 
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension !== type) {
    return { 
      valid: false, 
      error: `Invalid file type. Expected .${type} file, got .${extension}` 
    };
  }

  return { valid: true };
}

/**
 * Read file as text
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Parse and validate JSON content
 */
export function parseJSON(text) {
  try {
    const cleanText = text.replace(/^\uFEFF/, '');

    if (!cleanText.trim()) {
      return { success: false, error: 'File is empty or contains only whitespace' };
    }

    const data = JSON.parse(cleanText);

    // ⭐ VALIDATE BEFORE NORMALIZING
    const validation = validateImportStructure(data);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // ⭐ NORMALIZE SCHEMA - Handle different field names
    try {
      const normalized = normalizeImportPayload(data);
      console.log('✅ JSON parsed and normalized successfully');
      return { success: true, data: normalized };
    } catch (normError) {
      console.error('Schema normalization error:', normError);
      return { 
        success: false, 
        error: `Schema normalization failed: ${normError.message}` 
      };
    }

  } catch (error) {
    console.error('JSON Parse Error:', error);

    let errorMessage = 'Invalid JSON format';

    if (error instanceof SyntaxError) {
      const match = error.message.match(/position (\d+)/);
      if (match) {
        const position = parseInt(match[1]);
        const preview = text.substring(Math.max(0, position - 20), position + 20);
        errorMessage = `Syntax error near: "${preview}"`;
      } else {
        errorMessage = `Syntax error: ${error.message}`;
      }
    } else {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * ⭐ FIXED: Validate import data structure
 */
export function validateImportStructure(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid data: Expected JSON object' };
  }

  // ⭐ CHECK FOR TREKS FIRST (most important)
  if (!data.treks) {
    return { valid: false, error: 'Missing required field: "treks"' };
  }

  if (!Array.isArray(data.treks)) {
    return { valid: false, error: '"treks" must be an array' };
  }

  if (data.treks.length === 0) {
    return { valid: false, error: '"treks" array is empty' };
  }

  // ⭐ AUTO-GENERATE META if missing (non-blocking)
  if (!data.meta) {
    console.warn('⚠️ Missing "meta" field - Will auto-generate during normalization');
    data.meta = createDefaultMeta(data);
  }

  // ⭐ VALIDATE META STRUCTURE (non-blocking)
  const metaValidation = validateMeta(data.meta);
  if (!metaValidation.valid) {
    console.warn('⚠️ Meta validation warning:', metaValidation.error);
    data.meta = repairMeta(data.meta);
    console.log('🔧 Auto-repaired meta structure');
  }

  // Check for duplicate slugs
  const slugs = data.treks.map(t => t.slug).filter(Boolean);
  const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
  if (duplicates.length > 0) {
    return { 
      valid: false, 
      error: `Duplicate slugs found: ${[...new Set(duplicates)].join(', ')}` 
    };
  }

  console.log('✅ Structure validation passed');
  return { valid: true };
}

/**
 * Validate meta object structure
 */
export function validateMeta(meta) {
  if (!meta || typeof meta !== 'object') {
    return { valid: false, error: 'Meta must be an object' };
  }

  // Required fields (relaxed)
  const requiredFields = ['mode'];
  const missingFields = requiredFields.filter(field => !meta[field]);

  if (missingFields.length > 0) {
    return { 
      valid: false, 
      error: `Meta missing required fields: ${missingFields.join(', ')}` 
    };
  }

  // Validate mode (if present)
  if (meta.mode) {
    const validModes = ['replace_nested', 'merge', 'append'];
    if (!validModes.includes(meta.mode)) {
      return { 
        valid: false, 
        error: `Invalid mode: "${meta.mode}". Must be one of: ${validModes.join(', ')}` 
      };
    }
  }

  return { valid: true };
}

/**
 * Create default meta object
 */
export function createDefaultMeta(data) {
  const treksCount = Array.isArray(data.treks) ? data.treks.length : 0;
  const regionsCount = Array.isArray(data.regions) ? data.regions.length : 0;

  return {
    schema_version: '2.0',
    format: 'trek_import',
    mode: 'replace_nested',
    generated_by: 'admin_panel',
    generated_at: new Date().toISOString(),
    generator_version: '1.0.0',
    counts: {
      regions: regionsCount,
      treks: treksCount,
      total_itinerary_days: 0,
      total_highlights: 0,
      total_faqs: 0
    },
    validation: {
      strict_mode: false,
      allow_partial_import: true,
      skip_missing_images: true,
      validate_slugs: true,
      required_fields: ['slug', 'title', 'region_slug']
    },
    options: {
      overwrite_existing: true,
      create_missing_regions: false,
      preserve_reviews: true,
      preserve_bookings: true,
      update_timestamps: true
    },
    source: {
      type: 'manual_upload',
      origin: 'trek_admin_panel',
      environment: 'production',
      user: 'admin',
      notes: ''
    },
    processing: {
      batch_size: 10,
      timeout_seconds: 300,
      retry_failed: true,
      max_retries: 3
    }
  };
}

/**
 * Repair broken meta object
 */
export function repairMeta(meta) {
  const defaultMeta = createDefaultMeta({});

  return {
    ...defaultMeta,
    ...meta,
    schema_version: meta.schema_version || defaultMeta.schema_version,
    mode: meta.mode || defaultMeta.mode,
    generated_at: meta.generated_at || defaultMeta.generated_at,
    counts: { ...defaultMeta.counts, ...(meta.counts || {}) },
    validation: { ...defaultMeta.validation, ...(meta.validation || {}) },
    options: { ...defaultMeta.options, ...(meta.options || {}) },
    source: { ...defaultMeta.source, ...(meta.source || {}) },
    processing: { ...defaultMeta.processing, ...(meta.processing || {}) }
  };
}