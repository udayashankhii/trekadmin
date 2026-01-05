// src/components/api/admin.api.js
import axios from "axios";

const ADMIN_API_BASE_URL = (
  import.meta.env.VITE_ADMIN_API_BASE_URL || "http://127.0.0.1:8000/api/admin"
).replace(/\/$/, '');

const adminApi = axios.create({
  baseURL: ADMIN_API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// CSRF Token + Auth Token interceptor
adminApi.interceptors.request.use(
  (config) => {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    // Get Django session cookie (sessionid)
    const sessionId = document.cookie
      .split('; ')
      .find(row => row.startsWith('sessionid='))
      ?.split('=')[1];
    
    console.log('🔐 Has session?', !!sessionId);
    console.log('🔐 Has CSRF?', !!csrfToken);
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with better error handling
adminApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    
    let message = error.message || 'Request failed';
    
    // Handle different error types
    if (status === 401 || status === 403) {
      message = data?.detail || data?.message || 'Authentication required. Please login to Django admin first at http://127.0.0.1:8000/admin/';
      
      console.error('🚫 Authentication Error:', message);
      console.error('💡 Solution: Login at http://127.0.0.1:8000/admin/ then refresh this page');
    } else if (status === 400) {
      message = data?.detail || data?.message || 'Invalid request';
      
      // Log validation errors
      if (data?.errors) {
        console.error('🔍 Validation Errors:', data.errors);
      }
    } else if (status === 404) {
      message = 'Resource not found';
    } else if (status === 500) {
      message = 'Server error. Please try again later.';
    } else if (data?.detail) {
      message = data.detail;
    } else if (data?.message) {
      message = data.message;
    } else if (data?.error) {
      message = data.error;
    }
    
    return Promise.reject({ 
      status,
      message,
      data 
    });
  }
);

// -------- Authentication --------
export function adminLogin(username, password) {
  return adminApi.post("/auth/login/", { username, password });
}

export function adminLogout() {
  return adminApi.post("/auth/logout/");
}

export function checkAdminAuth() {
  return adminApi.get("/auth/check/");
}

// -------- Treks (admin list) --------
export function getAdminTreks() {
  console.log("🔍 Calling API: GET /treks-list/");
  return adminApi.get("/treks-list/").then(response => {
    console.log("📥 Raw API Response:", response);
    return response;
  });
}

export function getAdminTrek(id) {
  return adminApi.get(`/treks/${id}/`);
}

// -------- Treks Delete --------
export function deleteAdminTrek(slug) {
  console.log(`🗑️ Calling API: DELETE /import/full/${slug}/`);
  return adminApi.delete(`/import/full/${slug}/`).then(response => {
    console.log("✅ Delete Response:", response);
    return response;
  });
}

// -------- Full Import --------
export async function importFullTrek(payload) {
  console.log("📤 Calling API: POST /import/full/");
  console.log("📦 Payload:", {
    meta: payload.meta,
    regionsCount: payload.regions?.length || 0,
    treksCount: payload.treks?.length || 0
  });
  
  return adminApi.post("/import/full/", payload);
}

export async function importFullTreksBulk(importData, onProgress) {
  const treks = Array.isArray(importData) ? importData : importData.treks || [];
  const total = treks.length;
  const results = [];
  
  const payload = importData.meta ? importData : {
    meta: {
      schema_version: "1.0",
      mode: "replace_nested",
      generated_by: "admin_panel",
      generated_at: new Date().toISOString(),
    },
    regions: importData.regions || [],
    treks: treks,
  };

  console.log("📤 Starting bulk import:", {
    meta: payload.meta,
    regionsCount: payload.regions?.length || 0,
    treksCount: payload.treks?.length || 0,
    firstTrek: payload.treks[0]?.slug
  });

  try {
    if (onProgress) onProgress({ current: 0, total });
    
    const response = await importFullTrek(payload);
    
    console.log("✅ Bulk import response:", response);
    
    if (onProgress) onProgress({ current: total, total });
    
    const stats = response.stats || {};
    const errors = response.errors || [];
    
    console.log("📊 Import Stats:", stats);
    
    if (errors.length > 0) {
      console.error("⚠️ Import Errors:", errors);
    }
    
    // Create results based on stats
    const successCount = (stats.treks_created || 0) + (stats.treks_updated || 0);
    const createdCount = stats.treks_created || 0;
    
    if (successCount > 0 || errors.length > 0) {
      treks.forEach((trek, i) => {
        // Check if this trek has a specific error
        const hasError = errors.find(e => 
          e.trek === trek.slug || 
          e.trek === trek.title ||
          e.index === i
        );
        
        if (hasError) {
          results.push({
            trek: trek.title || trek.slug || `Trek ${i + 1}`,
            success: false,
            message: hasError.message || hasError.error || 'Import failed',
          });
        } else if (i < successCount) {
          results.push({
            trek: trek.title || trek.slug || `Trek ${i + 1}`,
            success: true,
            message: i < createdCount ? 'Created successfully' : 'Updated successfully',
          });
        } else {
          results.push({
            trek: trek.title || trek.slug || `Trek ${i + 1}`,
            success: false,
            message: 'Failed to import',
          });
        }
      });
    }
    
    // Add any remaining errors that weren't matched
    errors.forEach((err) => {
      if (!results.find(r => r.trek === (err.trek || 'Unknown'))) {
        results.push({
          trek: err.trek || 'Unknown',
          success: false,
          message: err.message || err.error || 'Import failed',
        });
      }
    });
    
    const finalSuccessCount = results.filter((r) => r.success).length;
    const finalFailCount = results.filter((r) => !r.success).length;
    
    console.log(`✅ Bulk import complete: ${finalSuccessCount} success, ${finalFailCount} failed`);
    
    return {
      results,
      stats,
      errors,
      successCount: finalSuccessCount,
      failCount: finalFailCount,
    };
  } catch (err) {
    console.error("❌ Bulk import failed:", {
      message: err?.message,
      status: err?.status,
      data: err?.data
    });
    
    // Parse detailed errors
    let errorDetails = [];
    let errorMessage = err?.message || 'Bulk import failed';
    
    if (err?.data?.errors) {
      errorDetails = Object.entries(err.data.errors).map(([field, msgs]) => ({
        field,
        messages: Array.isArray(msgs) ? msgs : [msgs]
      }));
      
      console.error("🔍 Validation Errors:", errorDetails);
      
      errorMessage = errorDetails
        .map(e => `${e.field}: ${e.messages.join(', ')}`)
        .join('; ');
    } else if (err?.data?.detail) {
      errorMessage = err.data.detail;
    }
    
    // Create error results for all treks
    treks.forEach((trek, i) => {
      results.push({
        trek: trek.title || trek.slug || `Trek ${i + 1}`,
        success: false,
        message: errorMessage,
      });
    });
    
    return {
      results,
      stats: {},
      errors: errorDetails.length > 0 
        ? errorDetails.map(e => ({
            message: `${e.field}: ${e.messages.join(', ')}`
          }))
        : [{ message: errorMessage }],
      successCount: 0,
      failCount: results.length,
    };
  }
}

export default adminApi;
