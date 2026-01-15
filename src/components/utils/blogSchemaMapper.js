// src/components/utils/blogSchemaMapper.js

/**
 * Professional blog schema mapper with format detection
 * Handles: single posts, bulk arrays, and meta-wrapped imports
 */

/**
 * Normalize blog post schema
 * Ensures all required and optional fields are properly structured
 */
export function normalizeBlogPostSchema(post) {
  if (!post || typeof post !== 'object') {
    throw new Error('Invalid post: Expected object');
  }

  console.log('📝 Normalizing blog post schema:', post.slug || post.title);

  const normalized = {
    // Core required fields
    slug: post.slug || '',
    title: post.title || '',

    // Publishing metadata
    status: post.status || 'draft',
    type: post.type || 'blog',
    contentType: post.contentType || post.content_type || 'article',
    language: post.language || 'en',

    // Content fields
    subtitle: post.subtitle || '',
    description: post.description || '',
    excerpt: post.excerpt || '',

    // SEO fields
    metaTitle: post.metaTitle || post.meta_title || post.title || '',
    metaDescription: post.metaDescription || post.meta_description || post.description || '',
    canonicalUrl: post.canonicalUrl || post.canonical_url || '',

    // Classification
    categorySlug: post.categorySlug || post.category_slug || post.category?.slug || '',
    regionSlug: post.regionSlug || post.region_slug || post.region?.slug || '',
    authorSlug: post.authorSlug || post.author_slug || post.author?.slug || '',

    // Dates
    publishDate: post.publishDate || post.publish_date || post.published_at || '',

    // Media
    image: post.image || '',

    // Engagement (preserve existing values, don't overwrite)
    views: post.views ?? post.engagement?.views ?? 0,
    likes: post.likes ?? post.engagement?.likes ?? 0,
    shares: post.shares ?? post.engagement?.shares ?? 0,

    // Flags
    isFeatured: post.isFeatured ?? post.is_featured ?? post.flags?.isFeatured ?? false,
    allowComments: post.allowComments ?? post.allow_comments ?? post.flags?.allowComments ?? true,
    isLiked: post.isLiked ?? post.is_liked ?? post.flags?.isLiked ?? false,
    isBookmarked: post.isBookmarked ?? post.is_bookmarked ?? post.flags?.isBookmarked ?? false,
  };

  // Complex nested objects - normalize if present
  if (post.featuredImage || post.featured_image) {
    normalized.featuredImage = normalizeFeaturedImage(post.featuredImage || post.featured_image);
  }

  if (post.images) {
    normalized.images = normalizeImages(post.images);
  }

  if (post.taxonomies) {
    normalized.taxonomies = normalizeTaxonomies(post.taxonomies);
  }

  if (post.contentSettings || post.content_settings) {
    normalized.contentSettings = post.contentSettings || post.content_settings;
  }

  if (post.toc) {
    normalized.toc = normalizeTOC(post.toc);
  }

  if (post.content) {
    normalized.content = normalizeContent(post.content);
  }

  if (post.cta) {
    normalized.cta = post.cta;
  }

  if (post.links) {
    normalized.links = normalizeLinks(post.links);
  }

  if (post.relatedPosts || post.related_posts) {
    normalized.relatedPosts = post.relatedPosts || post.related_posts;
  }

  if (post.seo) {
    normalized.seo = post.seo;
  }

  if (post.schema) {
    normalized.schema = post.schema;
  }

  if (post.social) {
    normalized.social = post.social;
  }

  if (post.editorial) {
    normalized.editorial = post.editorial;
  }

  console.log('✅ Blog post schema normalized successfully');
  return normalized;
}

/**
 * Normalize featured image
 */
function normalizeFeaturedImage(featuredImage) {
  if (typeof featuredImage === 'string') {
    return {
      url: featuredImage,
      alt: '',
      caption: ''
    };
  }

  return {
    url: featuredImage.url || '',
    alt: featuredImage.alt || '',
    caption: featuredImage.caption || ''
  };
}

/**
 * Normalize images array
 */
function normalizeImages(images) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.map(img => {
    if (typeof img === 'string') {
      return { url: img, alt: '', caption: '' };
    }
    return {
      url: img.url || '',
      alt: img.alt || '',
      caption: img.caption || ''
    };
  });
}

/**
 * Normalize taxonomies
 */
function normalizeTaxonomies(taxonomies) {
  return {
    focusKeyword: taxonomies.focusKeyword || taxonomies.focus_keyword || '',
    tags: Array.isArray(taxonomies.tags) ? taxonomies.tags : [],
    keywords: Array.isArray(taxonomies.keywords) ? taxonomies.keywords : []
  };
}

/**
 * Normalize table of contents
 */
function normalizeTOC(toc) {
  if (!Array.isArray(toc)) {
    return [];
  }

  return toc.map(item => ({
    id: item.id || '',
    title: item.title || '',
    level: item.level || 2
  }));
}

/**
 * Normalize content blocks
 */
function normalizeContent(content) {
  if (!content || typeof content !== 'object') {
    return content;
  }

  const normalized = {
    format: content.format || 'rich_blocks_v1',
    blocks: Array.isArray(content.blocks) ? content.blocks : []
  };

  // Include vlog if present
  if (content.vlog) {
    normalized.vlog = content.vlog;
  }

  return normalized;
}

/**
 * Normalize links
 */
function normalizeLinks(links) {
  return {
    internalLinks: Array.isArray(links.internalLinks || links.internal_links) 
      ? (links.internalLinks || links.internal_links) 
      : [],
    backlinks: Array.isArray(links.backlinks) 
      ? links.backlinks 
      : []
  };
}

/**
 * Normalize entire blog import payload
 * Detects format and normalizes accordingly
 */
export function normalizeBlogImportPayload(payload, importType) {
  console.log('🔄 Normalizing blog import payload...');
  console.log('📦 Import type:', importType);

  if (!payload) {
    throw new Error('Invalid payload: Expected data');
  }

  let normalized;

  switch (importType) {
    case 'bulk_with_meta':
      normalized = normalizeBulkWithMeta(payload);
      break;

    case 'bulk_array':
      normalized = normalizeBulkArray(payload);
      break;

    case 'single_post':
      normalized = normalizeSinglePost(payload);
      break;

    default:
      throw new Error(`Unsupported import type: ${importType}`);
  }

  console.log('✅ Blog payload normalized successfully');
  return normalized;
}

/**
 * Normalize bulk import with meta wrapper
 */
function normalizeBulkWithMeta(payload) {
  const baseMeta = {
    schema_version: '1.0',
    format: 'blog_import',
    mode: 'upsert',
    generated_by: 'blog_admin_panel',
    generated_at: new Date().toISOString(),
    generator_version: '1.0.0'
  };

  const normalized = {
    meta: payload.meta ? { ...baseMeta, ...payload.meta } : baseMeta,
    posts: []
  };

  // Normalize each post
  if (payload.posts && Array.isArray(payload.posts)) {
    normalized.posts = payload.posts.map((post, index) => {
      try {
        return normalizeBlogPostSchema(post);
      } catch (error) {
        console.error(`❌ Failed to normalize post ${index + 1}:`, error);
        throw new Error(`Post ${index + 1} (${post.title || post.slug}): ${error.message}`);
      }
    });
  }

  // Add statistics to meta
  const stats = calculateBlogStats(normalized.posts);
  normalized.meta.counts = stats;

  return normalized;
}

/**
 * Normalize direct array of posts
 * Wraps in meta structure
 */
function normalizeBulkArray(payload) {
  const meta = {
    schema_version: '1.0',
    format: 'blog_import',
    mode: 'upsert',
    generated_by: 'blog_admin_panel',
    generated_at: new Date().toISOString(),
    generator_version: '1.0.0'
  };

  const posts = payload.map((post, index) => {
    try {
      return normalizeBlogPostSchema(post);
    } catch (error) {
      console.error(`❌ Failed to normalize post ${index + 1}:`, error);
      throw new Error(`Post ${index + 1} (${post.title || post.slug}): ${error.message}`);
    }
  });

  const stats = calculateBlogStats(posts);
  meta.counts = stats;

  return { meta, posts };
}

/**
 * Normalize single post
 * Wraps in meta + posts array structure
 */
function normalizeSinglePost(payload) {
  const meta = {
    schema_version: '1.0',
    format: 'blog_import',
    mode: 'upsert',
    generated_by: 'blog_admin_panel',
    generated_at: new Date().toISOString(),
    generator_version: '1.0.0'
  };

  const normalizedPost = normalizeBlogPostSchema(payload);
  const posts = [normalizedPost];

  const stats = calculateBlogStats(posts);
  meta.counts = stats;

  return { meta, posts };
}

/**
 * Calculate blog statistics
 */
function calculateBlogStats(posts) {
  const stats = {
    posts: posts.length,
    total_images: 0,
    total_links: 0,
    total_faqs: 0,
    total_blocks: 0,
    languages: {},
    categories: {}
  };

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

    // Count content blocks and FAQs
    if (post.content?.blocks) {
      stats.total_blocks += post.content.blocks.length;

      const faqBlocks = post.content.blocks.filter(b => b.type === 'faq');
      faqBlocks.forEach(faq => {
        if (faq.items) {
          stats.total_faqs += faq.items.length;
        }
      });
    }

    // Track language distribution
    const lang = post.language || 'en';
    stats.languages[lang] = (stats.languages[lang] || 0) + 1;

    // Track category distribution
    const cat = post.categorySlug || 'uncategorized';
    stats.categories[cat] = (stats.categories[cat] || 0) + 1;
  });

  return stats;
}

/**
 * Validate normalized blog schema
 */
export function validateNormalizedBlogSchema(post) {
  const errors = [];
  const warnings = [];

  if (!post.slug) errors.push('Missing required field: slug');
  if (!post.title) errors.push('Missing required field: title');

  if (!post.description) warnings.push('Missing recommended field: description');
  if (!post.excerpt) warnings.push('Missing recommended field: excerpt');
  if (!post.metaTitle) warnings.push('Missing recommended field: metaTitle');
  if (!post.metaDescription) warnings.push('Missing recommended field: metaDescription');

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Export blog import template
export const BLOG_IMPORT_TEMPLATE = {
  meta: {
    schema_version: '1.0',
    format: 'blog_import',
    mode: 'upsert',
    generated_by: 'blog_admin_panel',
    generated_at: new Date().toISOString()
  },
  posts: [
    {
      slug: 'sample-blog-post',
      title: 'Sample Blog Post',
      subtitle: 'A comprehensive guide to...',
      status: 'draft',
      type: 'blog',
      contentType: 'article',
      language: 'en',
      categorySlug: 'trekking',
      regionSlug: 'everest',
      authorSlug: 'evertrek-nepal-team',
      publishDate: '2026-01-13T00:00:00+05:45',
      metaTitle: 'Sample Blog Post - Complete Guide',
      metaDescription: 'A detailed description for SEO purposes',
      description: 'Short introduction paragraph',
      excerpt: 'Brief summary for listings',
      difficulty: 'Moderate',
      canonicalUrl: 'https://evertreknepal.com/blog/sample-blog-post',
      image: 'https://example.com/image.jpg',
      featuredImage: {
        url: 'https://example.com/featured.jpg',
        alt: 'Featured image description',
        caption: 'Image caption'
      },
      images: [
        {
          url: 'https://example.com/image1.jpg',
          alt: 'Image 1 description',
          caption: 'Image 1 caption'
        }
      ],
      taxonomies: {
        focusKeyword: 'sample blog post',
        tags: ['tag1', 'tag2'],
        keywords: ['keyword1', 'keyword2']
      },
      contentSettings: {
        tocEnabled: true,
        tocMode: 'auto',
        tocIncludeLevels: [2, 3],
        vlogEnabled: false,
        shareEnabled: true
      },
      toc: [
        { id: 'section-1', title: 'Section 1', level: 2 }
      ],
      content: {
        format: 'rich_blocks_v1',
        blocks: [
          {
            type: 'heading',
            level: 2,
            id: 'section-1',
            text: 'Section 1'
          },
          {
            type: 'paragraph',
            spans: [
              { type: 'text', text: 'Sample paragraph content.' }
            ]
          }
        ]
      },
      cta: {
        primary: {
          label: 'Book Now',
          href: '/booking'
        }
      },
      links: {
        internalLinks: [
          { text: 'Related Post', href: '/blog/related-post' }
        ],
        backlinks: []
      },
      relatedPosts: [],
      seo: {},
      schema: {},
      social: {},
      editorial: {},
      isFeatured: false,
      allowComments: true
    }
  ]
};