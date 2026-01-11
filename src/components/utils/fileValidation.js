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
  
  // Check file size
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
  
  // Check file extension
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
    // Remove BOM if present
    const cleanText = text.replace(/^\uFEFF/, '');
    
    if (!cleanText.trim()) {
      return { success: false, error: 'File is empty or contains only whitespace' };
    }
    
    const data = JSON.parse(cleanText);
    
    // Basic structure validation
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
 * Validate basic import data structure
 */
export function validateImportStructure(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid data: Expected JSON object' };
  }
  
  // Check for required top-level fields
  if (!data.meta) {
    return { valid: false, error: 'Missing required field: "meta"' };
  }
  
  if (!data.treks) {
    return { valid: false, error: 'Missing required field: "treks"' };
  }
  
  // Validate treks is an array
  if (!Array.isArray(data.treks)) {
    return { valid: false, error: '"treks" must be an array' };
  }
  
  if (data.treks.length === 0) {
    return { valid: false, error: '"treks" array is empty' };
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
  
  console.log('✅ Basic structure validation passed');
  return { valid: true };
}
