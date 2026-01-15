// src/components/utils/blogTemplateGenerator.js
import { BLOG_IMPORT_TEMPLATE } from './blogschemaMapper';  // lowercase 's'


/**
 * Download blog import template
 */
export function downloadBlogTemplate(format = 'json') {
  try {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(BLOG_IMPORT_TEMPLATE, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blog-import-template-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true };
    }
    return { success: false, error: 'Unsupported format' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Download single post template
 */
export function downloadSinglePostTemplate() {
  try {
    const singlePostTemplate = BLOG_IMPORT_TEMPLATE.posts[0];

    const blob = new Blob([JSON.stringify(singlePostTemplate, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blog-single-post-template-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Download bulk posts template
 */
export function downloadBulkPostsTemplate() {
  try {
    const bulkTemplate = [
      BLOG_IMPORT_TEMPLATE.posts[0],
      {
        ...BLOG_IMPORT_TEMPLATE.posts[0],
        slug: 'another-sample-post',
        title: 'Another Sample Post'
      }
    ];

    const blob = new Blob([JSON.stringify(bulkTemplate, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blog-bulk-posts-template-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}