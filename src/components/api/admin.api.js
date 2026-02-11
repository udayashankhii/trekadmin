

// src/api/adminApi.js
import axios from "axios";
import { authService } from "./authservice.js";

const ADMIN_API_BASE_URL = (
  import.meta.env.VITE_ADMIN_API_BASE_URL || "http://127.0.0.1:8000/api/admin"
).replace(/\/$/, "");

const isDev = import.meta.env.DEV;
const enableDebugLogs = import.meta.env.VITE_ENABLE_DEBUG_LOGS === "true";

// Race condition prevention for token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ==============================================
// API LOGGER
// ==============================================

const apiLogger = {
  request: (config) => {
    if (isDev && enableDebugLogs) {
      console.log(`🔵 ${config.method?.toUpperCase()} ${config.url}`);
    }
  },
  response: (response) => {
    if (isDev && enableDebugLogs) {
      console.log(`✅ ${response.status} ${response.config.url}`);
    }
  },
  error: (error) => {
    console.error(`❌ API Error: ${error.response?.status || "ERR"}`, {
      url: error.config?.url,
      message: error.message,
    });

    if (isDev) {
      console.error("Error details:", error.response?.data);
    }
  },
};


const adminApi = axios.create({
  baseURL: ADMIN_API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ==============================================
// REQUEST INTERCEPTOR
// ==============================================

adminApi.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    apiLogger.request(config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==============================================
// RESPONSE INTERCEPTOR
// ==============================================

adminApi.interceptors.response.use(
  (response) => {
    apiLogger.response(response);
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return adminApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await authService.refreshAccessToken(ADMIN_API_BASE_URL);

        // Process all queued requests with new token
        processQueue(null, newAccessToken);

        // Retry the original request with new token
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return adminApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh failed - logout and redirect
        authService.clearTokens();

        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    apiLogger.error(error);

    const status = error.response?.status;
    const data = error.response?.data;

    let message = "Request failed";
    let errors = null;

    switch (status) {
      case 400:
        message = "Invalid request data";
        if (data?.import_result?.errors?.length > 0) {
          errors = data.import_result.errors;
          message = `Import errors: ${errors.map((e) => e.message || e).join("; ")}`;
        } else if (data?.errors) {
          errors = parseValidationErrors(data.errors);
          message = `Validation failed: ${errors.summary}`;
        } else if (data?.detail) {
          message = data.detail;
        }
        break;

      // ADD THIS RIGHT AFTER THE BREAK:

      case 403:
        message = "You do not have permission to perform this action";
        if (data?.detail) message = data.detail;
        break;

      case 404:
        message = "Resource not found";
        break;

      case 413:
        message = "Payload too large. Try uploading fewer items.";
        break;

      case 500:
        message = "Server error. Please try again.";
        if (isDev && data?.detail) message += ` - ${data.detail}`;
        break;

      case 502:
      case 503:
      case 504:
        message = "Service temporarily unavailable. Please try again later.";
        break;

      default:
        if (data?.detail) {
          message = data.detail;
        } else if (error.message) {
          message = error.message;
        }
    }

    // Handle network errors
    if (error.code === "ECONNABORTED") {
      message = "Request timeout. Try again or reduce data size.";
    } else if (error.code === "ERR_NETWORK") {
      message = "Cannot connect to server. Please check your connection.";
    }

    return Promise.reject({
      status,
      message,
      data,
      errors,
      originalError: error,
    });
  }
);

// ==============================================
// HELPER FUNCTIONS
// ==============================================

function parseValidationErrors(errors) {
  const details = [];
  let summary = "";

  if (Array.isArray(errors)) {
    // Handle array of objects or strings
    summary = errors.map(e => typeof e === 'object' ? (e.message || e.detail || JSON.stringify(e)) : e).join("; ");
    errors.forEach((err, idx) => {
      details.push({ field: `Error ${idx + 1}`, message: typeof err === 'object' ? (err.message || JSON.stringify(err)) : err });
    });
  } else if (typeof errors === "object") {
    Object.entries(errors).forEach(([field, messages]) => {
      const msgs = Array.isArray(messages) ? messages : [messages];
      // FIX: Ensure we map objects to strings
      const msgString = msgs.map(m => typeof m === 'object' ? (m.message || JSON.stringify(m)) : m).join(", ");
      details.push({ field, message: msgString });
    });
    summary = details.map((d) => `${d.field}: ${d.message}`).join("; ");
  } else {
    summary = String(errors);
  }

  return { summary, details };
}


function validateImportPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload: Expected object");
  }

  if (!payload.meta) {
    throw new Error("Invalid payload: Missing 'meta' field");
  }

  // Check for either 'treks' OR 'tours'
  if (!payload.treks && !payload.tours) {
    throw new Error("Invalid payload: Must have 'treks' or 'tours' array");
  }

  // Validate treks if present
  if (payload.treks && Array.isArray(payload.treks)) {
    if (payload.treks.length === 0) {
      throw new Error("Invalid payload: 'treks' array is empty");
    }
    payload.treks.forEach((trek, index) => {
      if (!trek.slug) {
        throw new Error(`Trek ${index + 1}: Missing 'slug'`);
      }
      if (!trek.title) {
        throw new Error(`Trek ${index + 1}: Missing 'title'`);
      }
    });
  }

  // Validate tours if present
  if (payload.tours && Array.isArray(payload.tours)) {
    if (payload.tours.length === 0) {
      throw new Error("Invalid payload: 'tours' array is empty");
    }
    payload.tours.forEach((tour, index) => {
      if (!tour.slug) {
        throw new Error(`Tour ${index + 1}: Missing 'slug'`);
      }
      if (!tour.title) {
        throw new Error(`Tour ${index + 1}: Missing 'title'`);
      }
    });
  }
}


// ==============================================
// AUTHENTICATION API METHODS
// ==============================================

export async function adminLogin(emailOrUsername, password) {
  try {
    if (!emailOrUsername?.trim() || !password?.trim()) {
      throw new Error("Email/username and password are required");
    }

    const payload = {};
    if (emailOrUsername.includes("@")) {
      payload.email = emailOrUsername.trim();
    } else {
      payload.username = emailOrUsername.trim();
    }
    payload.password = password.trim();


    const response = await axios.post(
      `${ADMIN_API_BASE_URL}/auth/login/`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );


    const { access, refresh, user } = response.data;
    if (access && refresh) {
      authService.setTokens(access, refresh, user);
    }

    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Admin login failed",
      status: error.response?.status,
      data: error.response?.data,
    };
  }
}


export async function adminLogout() {
  try {
    const refreshToken = authService.getRefreshToken();

    if (refreshToken) {
      await axios.post(
        `${ADMIN_API_BASE_URL}/auth/logout/`,
        { refresh: refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Admin logout error:", error);

  } finally {
    authService.clearTokens();
  }
}

export async function checkAdminAuth() {
  try {
    const token = authService.getAccessToken();

    if (!token) {
      return false;
    }

    const response = await adminApi.get("/auth/me/");
    return response;
  } catch (error) {
    authService.clearTokens();
    return false;
  }
}

// ==============================================
// TREK API METHODS
// ==============================================

export async function getAdminTreks() {
  return adminApi.get("/treks-list/");
}

export async function getAdminTrek(slug) {
  const data = await adminApi.get(`/import/full/${slug}/`);
  // If it's wrapped in the import format { treks: [...] }, extract it
  if (data && data.treks && Array.isArray(data.treks) && data.treks.length > 0) {
    return data.treks[0];
  }
  return data;
}

export async function searchAdminTreks(query) {
  return adminApi.get(`/treks/`, {
    params: { search: query },
  });
}

export const deleteTrekApi = async (slug, token) => {
  return axios.delete(`${ADMIN_API_BASE}/treks/${slug}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Get all tours for admin list view
 * GET /api/admin/tours-list/
 */
export async function getAdminToursList() {
  const data = await adminApi.get("/tours-list/");
  // Handle both flat arrays and paginated responses { results: [], ... }
  if (data && data.results && Array.isArray(data.results)) {
    return data.results;
  }
  return data;
}

/**
 * Get single tour by slug
 * GET /api/admin/tours/import/full/<slug>/
 */
export async function getAdminTour(slug) {
  const data = await adminApi.get(`/tours/import/full/${slug}/`);
  // If it's wrapped in the import format { tours: [...] }, extract it
  if (data && data.tours && Array.isArray(data.tours) && data.tours.length > 0) {
    return data.tours[0];
  }
  return data;
}

/**
 * Delete single tour by slug
 * DELETE /api/admin/tours/import/full/<slug>/
 */
export async function deleteAdminTour(slug) {
  try {
    const response = await adminApi.delete(`/tours/import/full/${slug}/`);
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Import full tour payload (single or bulk)
 * POST /api/admin/tours/import/full/
 */
export async function importFullTour(payload) {
  return adminApi.post("/tours/import/full/", payload);
}

/**
 * Update single tour (full PUT)
 * PUT /api/admin/tours/import/full/<slug>/
 */
export async function updateTourFull(slug, payload) {
  return adminApi.put(`/tours/import/full/${slug}/`, payload);
}

/**
 * Update single tour (partial PATCH)
 * PATCH /api/admin/tours/import/full/<slug>/
 */
export async function updateTourPartial(slug, payload) {
  return adminApi.patch(`/tours/import/full/${slug}/`, payload);
}

/**
 * Bulk import tours with progress tracking
 * POST /api/admin/tours/import/full/
 */
export async function importFullToursBulk(importData, onProgress) {
  const startTime = Date.now();
  const tours = Array.isArray(importData) ? importData : importData.tours || [];
  const total = tours.length;

  // Build complete payload with meta
  const payload = importData.meta
    ? importData
    : {
      tours: tours,
    };

  try {
    if (onProgress) onProgress({ current: 0, total });

    const response = await importFullTour(payload);

    if (onProgress) onProgress({ current: total, total });

    // Handle response format from tour_importer_service.py
    const importResult = response.import_result || response || {};
    const stats = importResult.stats || {};
    const errors = importResult.errors || [];
    const warnings = importResult.warnings || [];
    const ok = importResult.ok !== undefined ? importResult.ok : true;

    const isSuccess = ok && errors.length === 0;

    const created = stats.tours_created || 0;
    const updated = stats.tours_updated || 0;
    const successCount = created + updated;
    const failCount = isSuccess ? 0 : total - successCount;

    // Build individual tour results
    const results = tours.map((tour, index) => {
      const tourError = errors.find(
        (e) =>
          e.tour === tour.slug ||
          e.slug === tour.slug ||
          e.index === index ||
          e.field?.includes(tour.slug)
      );

      if (tourError) {
        return {
          tour: tour.title || tour.slug,
          slug: tour.slug,
          success: false,
          message: tourError.message || tourError.error || tourError.detail || "Import failed",
        };
      }

      if (isSuccess || index < successCount) {
        return {
          tour: tour.title || tour.slug,
          slug: tour.slug,
          success: true,
          message: created > 0 ? "Created successfully" : "Updated successfully",
          action: created > 0 ? "created" : "updated",
        };
      }

      return {
        tour: tour.title || tour.slug,
        slug: tour.slug,
        success: false,
        message: "Import status unknown",
      };
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (isDev && enableDebugLogs) {
      console.log(`✅ Tour import completed in ${duration}s:`, {
        total,
        success: successCount,
        failed: failCount,
        created,
        updated,
      });
    }

    return {
      success: isSuccess && failCount === 0,
      results,
      stats,
      errors,
      warnings,
      successCount,
      failCount,
      duration,
      importOk: ok,
    };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    let errorDetails = [];
    let errorMessage = error.message || "Bulk import failed";

    if (error.errors?.details) {
      errorDetails = error.errors.details;
    } else if (error.data?.import_result?.errors) {
      errorDetails = error.data.import_result.errors;
      errorMessage = errorDetails.map((e) => e.message || e.error || e).join("; ");
    } else if (error.data?.errors) {
      const parsed = parseValidationErrors(error.data.errors);
      errorDetails = parsed.details;
      errorMessage = parsed.summary;
    }

    // Build error results for each tour
    const results = tours.map((tour, index) => {
      const specificError = errorDetails.find(
        (e) =>
          e.field?.includes(String(index)) ||
          e.field === tour.slug ||
          e.tour === tour.slug ||
          e.slug === tour.slug
      );

      return {
        tour: tour.title || tour.slug || `Tour ${index + 1}`,
        slug: tour.slug,
        success: false,
        message: specificError
          ? specificError.message || specificError.error || specificError
          : errorMessage,
      };
    });

    return {
      success: false,
      results,
      stats: {},
      errors: errorDetails.length > 0 ? errorDetails : [{ message: errorMessage }],
      warnings: [],
      successCount: 0,
      failCount: results.length,
      duration,
      importOk: false,
    };
  }
}
export async function importFullTrek(payload) {
  validateImportPayload(payload);
  return adminApi.post("/import/full/", payload);
}

export async function updateTrekFull(slug, payload) {
  return adminApi.put(`/import/full/${slug}/`, payload);
}

export async function updateTrekPartial(slug, payload) {
  return adminApi.patch(`/import/full/${slug}/`, payload);
}

export async function importFullTreksBulk(importData, onProgress) {
  const startTime = Date.now();
  const treks = Array.isArray(importData) ? importData : importData.treks || [];
  const total = treks.length;

  const payload = importData.meta
    ? importData
    : {
      meta: {
        schema_version: "1.0",
        mode: "replace_nested",
        generated_by: "admin_panel",
        generated_at: new Date().toISOString(),
      },
      regions: importData.regions || [],
      treks: treks,
    };

  try {
    if (onProgress) onProgress({ current: 0, total });

    const response = await importFullTrek(payload);

    if (onProgress) onProgress({ current: total, total });

    const importResult = response.import_result || {};
    const stats = importResult.stats || {};
    const errors = importResult.errors || [];
    const warnings = importResult.warnings || [];
    const ok = importResult.ok !== undefined ? importResult.ok : true;

    const isSuccess = ok && errors.length === 0;

    const created = stats.treks_created || 0;
    const updated = stats.treks_updated || 0;
    const successCount = created + updated;
    const failCount = isSuccess ? 0 : total - successCount;

    const results = treks.map((trek, index) => {
      const trekError = errors.find(
        (e) =>
          e.trek === trek.slug ||
          e.slug === trek.slug ||
          e.index === index ||
          e.field?.includes(trek.slug)
      );

      if (trekError) {
        return {
          trek: trek.title || trek.slug,
          slug: trek.slug,
          success: false,
          message: trekError.message || trekError.error || trekError.detail || "Import failed",
        };
      }

      if (isSuccess || index < successCount) {
        return {
          trek: trek.title || trek.slug,
          slug: trek.slug,
          success: true,
          message: created > 0 ? "Created successfully" : "Updated successfully",
          action: created > 0 ? "created" : "updated",
        };
      }

      return {
        trek: trek.title || trek.slug,
        slug: trek.slug,
        success: false,
        message: "Import status unknown",
      };
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (isDev && enableDebugLogs) {
      console.log(`✅ Import completed in ${duration}s:`, {
        total,
        success: successCount,
        failed: failCount,
        created,
        updated,
      });
    }

    return {
      success: isSuccess && failCount === 0,
      results,
      stats,
      errors,
      warnings,
      successCount,
      failCount,
      duration,
      importOk: ok,
    };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    let errorDetails = [];
    let errorMessage = error.message || "Bulk import failed";

    if (error.errors?.details) {
      errorDetails = error.errors.details;
    } else if (error.data?.import_result?.errors) {
      errorDetails = error.data.import_result.errors;
      errorMessage = errorDetails.map((e) => e.message || e.error || e).join("; ");
    } else if (error.data?.errors) {
      const parsed = parseValidationErrors(error.data.errors);
      errorDetails = parsed.details;
      errorMessage = parsed.summary;
    }

    const results = treks.map((trek, index) => {
      const specificError = errorDetails.find(
        (e) =>
          e.field?.includes(String(index)) ||
          e.field === trek.slug ||
          e.trek === trek.slug ||
          e.slug === trek.slug
      );

      return {
        trek: trek.title || trek.slug || `Trek ${index + 1}`,
        slug: trek.slug,
        success: false,
        message: specificError
          ? specificError.message || specificError.error || specificError
          : errorMessage,
      };
    });

    return {
      success: false,
      results,
      stats: {},
      errors: errorDetails.length > 0 ? errorDetails : [{ message: errorMessage }],
      warnings: [],
      successCount: 0,
      failCount: results.length,
      duration,
      importOk: false,
    };
  }
}

// ==============================================
// BLOG API METHODS
// ==============================================

export function getAdminBlogPosts(params = {}) {
  return adminApi.get("/blog-posts/", { params });
}

export function getAdminBlogPost(slug, params = {}) {
  return adminApi.get(`/blog-posts/${slug}/`, { params });
}

export function createAdminBlogPost(payload) {
  const isForm = payload instanceof FormData;
  return adminApi.post("/blog-posts/", payload, {
    headers: isForm ? { "Content-Type": "multipart/form-data" } : undefined,
  });
}

export function updateAdminBlogPost(slug, payload, params = {}) {
  const isForm = payload instanceof FormData;
  return adminApi.patch(`/blog-posts/${slug}/`, payload, {
    params,
    headers: isForm ? { "Content-Type": "multipart/form-data" } : undefined,
  });
}

export function deleteAdminBlogPost(slug, params = {}) {
  return adminApi.delete(`/blog-posts/${slug}/`, { params });
}

export function getAdminBlogCategories(params = {}) {
  return adminApi.get("/blog-categories/", { params });
}

export function getAdminBlogRegions(params = {}) {
  return adminApi.get("/blog-regions/", { params });
}

export function getAdminBlogAuthors(params = {}) {
  return adminApi.get("/blog-authors/", { params });
}

export function importBlogPosts(payload) {
  return adminApi.post("/blog/import/full/", payload);
}

export function importBlogPostBySlug(slug, payload, params = {}) {
  return adminApi.patch(`/blog/import/full/${slug}/`, payload, { params });
}

export default adminApi;

export const importCloudinaryImages = async (payload) => {
  const token = localStorage.getItem('token'); // or 'admin_token' - check what you use

  const response = await fetch('http://localhost:8000/api/admin/cloudinary/import/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to import Cloudinary images');
  }

  return response.json();
};




// ==============================================
// TRAVEL INFO API METHODS (add after Blog section)
// ==============================================

export function getAdminTravelInfoPages(params = {}) {
  return adminApi.get("/travel-info/", { params });
}

export function getAdminTravelInfoPage(slug) {
  return adminApi.get(`/travel-info/${slug}/`);
}

export function createAdminTravelInfoPage(payload) {
  return adminApi.post("/travel-info/", payload);
}

export function updateAdminTravelInfoPage(slug, payload) {
  return adminApi.patch(`/travel-info/${slug}/`, payload);
}

export function deleteAdminTravelInfoPage(slug) {
  return adminApi.delete(`/travel-info/${slug}/`);
}

// ==============================================
// TRAVEL STYLES API METHODS
// ==============================================

export function getAdminTravelStyles(params = {}) {
  return adminApi.get("/travel-styles/", { params });
}

export function getAdminTravelStyle(slug) {
  return adminApi.get(`/travel-styles/${slug}/`);
}

export function createAdminTravelStyle(payload) {
  return adminApi.post("/travel-styles/", payload);
}

export function updateAdminTravelStyle(slug, payload) {
  return adminApi.patch(`/travel-styles/${slug}/`, payload);
}

export function deleteAdminTravelStyle(slug) {
  return adminApi.delete(`/travel-styles/${slug}/`);
}

export function importAdminTravelStyles(payload, config = {}) {
  const isForm = payload instanceof FormData;
  const headers = { ...(config.headers || {}) };
  if (isForm) {
    headers["Content-Type"] = undefined;
  }
  return adminApi.post("/travel-styles/import/full/", payload, {
    ...config,
    headers,
  });
}

export function importAdminTravelStyleBySlug(slug, payload, config = {}) {
  const isForm = payload instanceof FormData;
  const headers = { ...(config.headers || {}) };
  if (isForm) {
    headers["Content-Type"] = undefined;
  }
  return adminApi.patch(`/travel-styles/import/full/${slug}/`, payload, {
    ...config,
    headers,
  });
}

export function getAdminTravelStyleTours(slug) {
  return adminApi.get(`/travel-styles/${slug}/tours/`);
}

// ==============================================
// ABOUT PAGES API METHODS
// ==============================================

export function getAdminAboutPages(params = {}) {
  return adminApi.get("/about-pages/", { params });
}

export function getAdminAboutPage(slug) {
  return adminApi.get(`/about-pages/${slug}/`);
}

export function createAdminAboutPage(payload) {
  return adminApi.post("/about-pages/", payload);
}

export function updateAdminAboutPage(slug, payload) {
  return adminApi.patch(`/about-pages/${slug}/`, payload);
}

export function deleteAdminAboutPage(slug) {
  return adminApi.delete(`/about-pages/${slug}/`);
}

export function importAdminAboutPages(payload, config = {}) {
  return adminApi.post("/about-pages/import/full/", payload, config);
}
