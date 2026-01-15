// / src/components/utils/blogFileValidation.js

import { normalizeBlogImportPayload } from './blogSchemaMapper';

// File size limits (in bytes)
export const BLOG_FILE_SIZE_LIMITS = {
  json: 10 * 1024 * 1024, // 10MB
  csv: 5 * 1024 * 1024,   // 5MB
};

// Allowed MIME types
export const BLOG_ALLOWED_MIME_TYPES = {
  json: ['application/json', 'text/json', ''],
  csv: ['text/csv', 'application/csv', 'text/comma-separated-values'],
};

/**
 * Validate blog file before processing
 */
export function validateBlogFile(file, type) {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  const maxSize = BLOG_FILE_SIZE_LIMITS[type];
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
 * Read blog file as text
 */
export function readBlogFileAsText(file) {
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
 * Parse and validate blog JSON content
 */
export function parseBlogJSON(text) {
  try {
    const cleanText = text.replace(/^﻿/, ''); // Remove BOM

    if (!cleanText.trim()) {
      return { success: false, error: 'File is empty or contains only whitespace' };
    }

    const data = JSON.parse(cleanText);

    // ⭐ DETECT IMPORT FORMAT
    const importType = detectBlogImportFormat(data);
    console.log('🔍 Detected blog import format:', importType);

    // ⭐ VALIDATE BASED ON FORMAT
    const validation = validateBlogImportStructure(data, importType);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // ⭐ NORMALIZE SCHEMA - Handle different field names
    try {
      const normalized = normalizeBlogImportPayload(data, importType);
      console.log('✅ Blog JSON parsed and normalized successfully');
      return { success: true, data: normalized, importType };
    } catch (normError) {
      console.error('Blog schema normalization error:', normError);
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
 * ⭐ DETECT BLOG IMPORT FORMAT
 * Supports: single post, bulk posts, or meta-wrapped format
 */
export function detectBlogImportFormat(data) {
  if (!data || typeof data !== 'object') {
    return 'unknown';
  }

  // Format 1: Bulk with meta wrapper
  // { meta: {...}, posts: [...] }
  if (data.meta && data.posts && Array.isArray(data.posts)) {
    return 'bulk_with_meta';
  }

  // Format 2: Direct array of posts
  // [{ slug: "...", title: "..." }, ...]
  if (Array.isArray(data)) {
    return 'bulk_array';
  }

  // Format 3: Single blog post object
  // { slug: "...", title: "...", content: {...} }
  if (data.slug || data.title) {
    return 'single_post';
  }

  return 'unknown';
}

/**
 * ⭐ VALIDATE BLOG IMPORT STRUCTURE
 */
export function validateBlogImportStructure(data, importType) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid data: Expected JSON object or array' };
  }

  switch (importType) {
    case 'bulk_with_meta':
      return validateBulkWithMeta(data);

    case 'bulk_array':
      return validateBulkArray(data);

    case 'single_post':
      return validateSinglePost(data);

    default:
      return { 
        valid: false, 
        error: 'Unrecognized blog import format. Expected single post, array of posts, or meta-wrapped format.' 
      };
  }
}

/**
 * Validate bulk import with meta wrapper
 * Format: { meta: {...}, posts: [...] }
 */
function validateBulkWithMeta(data) {
  if (!data.posts || !Array.isArray(data.posts)) {
    return { valid: false, error: 'Missing or invalid "posts" array' };
  }

  if (data.posts.length === 0) {
    return { valid: false, error: '"posts" array is empty' };
  }

  // Validate meta (optional but recommended)
  if (data.meta && typeof data.meta !== 'object') {
    return { valid: false, error: '"meta" must be an object' };
  }

  // Validate each post
  for (let i = 0; i < data.posts.length; i++) {
    const postValidation = validatePostFields(data.posts[i], i);
    if (!postValidation.valid) {
      return postValidation;
    }
  }

  // Check for duplicate slugs
  const slugs = data.posts.map(p => p.slug).filter(Boolean);
  const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
  if (duplicates.length > 0) {
    return { 
      valid: false, 
      error: `Duplicate slugs found: ${[...new Set(duplicates)].join(', ')}` 
    };
  }

  console.log('✅ Bulk with meta validation passed');
  return { valid: true };
}

/**
 * Validate direct array of posts
 * Format: [{ slug: "...", title: "..." }, ...]
 */
function validateBulkArray(data) {
  if (!Array.isArray(data)) {
    return { valid: false, error: 'Expected array of blog posts' };
  }

  if (data.length === 0) {
    return { valid: false, error: 'Posts array is empty' };
  }

  // Validate each post
  for (let i = 0; i < data.length; i++) {
    const postValidation = validatePostFields(data[i], i);
    if (!postValidation.valid) {
      return postValidation;
    }
  }

  // Check for duplicate slugs
  const slugs = data.map(p => p.slug).filter(Boolean);
  const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
  if (duplicates.length > 0) {
    return { 
      valid: false, 
      error: `Duplicate slugs found: ${[...new Set(duplicates)].join(', ')}` 
    };
  }

  console.log('✅ Bulk array validation passed');
  return { valid: true };
}

/**
 * Validate single blog post
 * Format: { slug: "...", title: "...", content: {...} }
 */
function validateSinglePost(data) {
  return validatePostFields(data, 0);
}

/**
 * Validate individual blog post fields
 */
function validatePostFields(post, index) {
  if (!post || typeof post !== 'object') {
    return { 
      valid: false, 
      error: `Post ${index + 1}: Invalid post data (must be an object)` 
    };
  }

  // Required fields
  if (!post.slug) {
    return { 
      valid: false, 
      error: `Post ${index + 1}: Missing required field "slug"` 
    };
  }

  if (!post.title) {
    return { 
      valid: false, 
      error: `Post ${index + 1}: Missing required field "title"` 
    };
  }

  // Validate slug format
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugPattern.test(post.slug)) {
    return { 
      valid: false, 
      error: `Post ${index + 1}: Invalid slug format "${post.slug}". Use lowercase letters, numbers, and hyphens only.` 
    };
  }

  // Warn about recommended fields (non-blocking)
  const recommendedFields = ['description', 'excerpt', 'status', 'language'];
  const missingRecommended = recommendedFields.filter(field => !post[field]);
  if (missingRecommended.length > 0) {
    console.warn(
      `⚠️ Post ${index + 1} (${post.slug}): Missing recommended fields: ${missingRecommended.join(', ')}`
    );
  }

  console.log(`✅ Post ${index + 1} (${post.slug}): Validation passed`);
  return { valid: true };
}

/**
 * Create default blog meta object
 */
export function createDefaultBlogMeta(data) {
  let postsCount = 0;

  if (Array.isArray(data)) {
    postsCount = data.length;
  } else if (data.posts && Array.isArray(data.posts)) {
    postsCount = data.posts.length;
  } else if (data.slug) {
    postsCount = 1;
  }

  return {
    schema_version: '1.0',
    format: 'blog_import',
    mode: 'upsert', // Create or update
    generated_by: 'blog_admin_panel',
    generated_at: new Date().toISOString(),
    generator_version: '1.0.0',
    counts: {
      posts: postsCount,
      total_images: 0,
      total_links: 0,
      total_faqs: 0
    },
    validation: {
      strict_mode: false,
      allow_partial_import: true,
      skip_missing_images: true,
      validate_slugs: true,
      required_fields: ['slug', 'title']
    },
    options: {
      overwrite_existing: true,
      preserve_engagement: true, // Don't overwrite views/likes
      preserve_comments: true,
      update_timestamps: true
    },
    source: {
      type: 'manual_upload',
      origin: 'blog_admin_panel',
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
 * Calculate blog import statistics
 */
export function calculateBlogStatistics(payload) {
  const stats = {
    posts: 0,
    total_images: 0,
    total_links: 0,
    total_faqs: 0,
    total_blocks: 0,
    languages: new Set(),
    categories: new Set()
  };

  let posts = [];

  // Extract posts based on format
  if (Array.isArray(payload)) {
    posts = payload;
  } else if (payload.posts && Array.isArray(payload.posts)) {
    posts = payload.posts;
  } else if (payload.slug) {
    posts = [payload];
  }

  stats.posts = posts.length;

  posts.forEach(post => {
    // Count images
    if (post.images && Array.isArray(post.images)) {
      stats.total_images += post.images.length;
    }
    if (post.featuredImage) {
      stats.total_images += 1;
    }

    // Count links
    if (post.links?.internalLinks) {
      stats.total_links += post.links.internalLinks.length;
    }
    if (post.links?.backlinks) {
      stats.total_links += post.links.backlinks.length;
    }

    // Count FAQ blocks
    if (post.content?.blocks) {
      const faqBlocks = post.content.blocks.filter(b => b.type === 'faq');
      faqBlocks.forEach(faq => {
        if (faq.items) {
          stats.total_faqs += faq.items.length;
        }
      });
      stats.total_blocks += post.content.blocks.length;
    }

    // Track languages and categories
    if (post.language) {
      stats.languages.add(post.language);
    }
    if (post.categorySlug) {
      stats.categories.add(post.categorySlug);
    }
  });

  // Convert Sets to arrays for JSON serialization
  stats.languages = Array.from(stats.languages);
  stats.categories = Array.from(stats.categories);

  return stats;
}