// // src/components/api/admin.api.js
// import axios from "axios";
// import { authService } from "./auth.api";

// const ADMIN_API_BASE_URL = (
//   import.meta.env.VITE_ADMIN_API_BASE_URL || "http://127.0.0.1:8000/api/admin"
// ).replace(/\/$/, '');

// const isDev = import.meta.env.DEV;
// const enableDebugLogs = import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true' || false;

// // Race condition prevention for token refresh
// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach(prom => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
  
//   failedQueue = [];
// };

// // API Logger - Only logs in development mode
// const apiLogger = {
//   request: (config) => {
//     if (isDev && enableDebugLogs) {
//       console.log(`🔵 ${config.method?.toUpperCase()} ${config.url}`);
//     }
//   },
//   response: (response) => {
//     if (isDev && enableDebugLogs) {
//       console.log(`✅ ${response.status} ${response.config.url}`);
//     }
//   },
//   error: (error) => {
//     // Always log errors, even in production
//     console.error(`❌ API Error: ${error.response?.status || 'ERR'}`, {
//       url: error.config?.url,
//       message: error.message,
//     });
    
//     // Detailed error only in dev
//     if (isDev) {
//       console.error('Error details:', error.response?.data);
//     }
//   }
// };

// const adminApi = axios.create({
//   baseURL: ADMIN_API_BASE_URL,
//   timeout: 60000,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });

// // Request interceptor - Add JWT Authorization header
// adminApi.interceptors.request.use(
//   (config) => {
//     const token = authService.getAccessToken();
    
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }

//     apiLogger.request(config);
//     return config;
//   },
//   (error) => {
//     console.error('🔴 Request Error:', error);
//     return Promise.reject(error);
//   }
// );

// // Response interceptor - Handle token refresh and errors
// adminApi.interceptors.response.use(
//   (response) => {
//     apiLogger.response(response);
//     return response.data;
//   },
//   async (error) => {
//     const originalRequest = error.config;
    
//     // Handle 401 - Token expired or invalid
//     if (error.response?.status === 401 && !originalRequest._retry) {
      
//       // If already refreshing, queue this request
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then(token => {
//             originalRequest.headers['Authorization'] = `Bearer ${token}`;
//             return adminApi(originalRequest);
//           })
//           .catch(err => {
//             return Promise.reject(err);
//           });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         const newAccessToken = await authService.refreshAccessToken();
//         authService.setAccessToken(newAccessToken);
        
//         // Process all queued requests with new token
//         processQueue(null, newAccessToken);
        
//         // Retry the original request with new token
//         originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
//         return adminApi(originalRequest);
        
//       } catch (refreshError) {
//         processQueue(refreshError, null);
        
//         // Refresh failed - logout and redirect
//         await authService.logout();
        
//         if (typeof window !== 'undefined') {
//           window.location.href = '/login';
//         }
        
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }
    
//     // Handle other errors
//     apiLogger.error(error);
    
//     const status = error.response?.status;
//     const data = error.response?.data;
    
//     let message = 'Request failed';
//     let errors = null;
    
//     switch (status) {
//       case 400:
//         message = 'Invalid request data';
//         if (data?.import_result?.errors?.length > 0) {
//           errors = data.import_result.errors;
//           message = `Import errors: ${errors.map(e => e.message || e).join('; ')}`;
//         } else if (data?.errors) {
//           errors = parseValidationErrors(data.errors);
//           message = `Validation failed: ${errors.summary}`;
//         } else if (data?.detail) {
//           message = data.detail;
//         }
//         break;
        
//       case 403:
//         message = 'You do not have permission to perform this action';
//         if (data?.detail) {
//           message = data.detail;
//         }
//         break;
        
//       case 404:
//         message = 'Resource not found';
//         break;
        
//       case 413:
//         message = 'Payload too large. Try uploading fewer treks.';
//         break;
        
//       case 500:
//         message = 'Server error. Please try again.';
//         if (isDev && data?.detail) {
//           message += ` - ${data.detail}`;
//         }
//         break;
        
//       case 502:
//       case 503:
//       case 504:
//         message = 'Service temporarily unavailable. Please try again later.';
//         break;
        
//       default:
//         if (data?.detail) {
//           message = data.detail;
//         } else if (error.message) {
//           message = error.message;
//         }
//     }
    
//     // Handle network errors
//     if (error.code === 'ECONNABORTED') {
//       message = 'Request timeout. Try again or reduce data size.';
//     } else if (error.code === 'ERR_NETWORK') {
//       message = 'Cannot connect to server. Please check your connection.';
//     }
    
//     return Promise.reject({ 
//       status,
//       message,
//       data,
//       errors,
//       originalError: error
//     });
//   }
// );

// // Helper functions
// function parseValidationErrors(errors) {
//   const details = [];
//   let summary = '';
  
//   if (Array.isArray(errors)) {
//     summary = errors.join('; ');
//     errors.forEach((err, idx) => {
//       details.push({ field: `Error ${idx + 1}`, message: err });
//     });
//   } else if (typeof errors === 'object') {
//     Object.entries(errors).forEach(([field, messages]) => {
//       const msgs = Array.isArray(messages) ? messages : [messages];
//       details.push({ field, message: msgs.join(', ') });
//     });
//     summary = details.map(d => `${d.field}: ${d.message}`).join('; ');
//   } else {
//     summary = String(errors);
//   }
  
//   return { summary, details };
// }

// function validateImportPayload(payload) {
//   if (!payload || typeof payload !== 'object') {
//     throw new Error("Invalid payload: Expected object");
//   }
  
//   if (!payload.meta) {
//     throw new Error("Invalid payload: Missing 'meta' field");
//   }
  
//   if (!payload.treks || !Array.isArray(payload.treks)) {
//     throw new Error("Invalid payload: 'treks' must be an array");
//   }
  
//   if (payload.treks.length === 0) {
//     throw new Error("Invalid payload: 'treks' array is empty");
//   }
  
//   payload.treks.forEach((trek, index) => {
//     if (!trek.slug) {
//       throw new Error(`Trek ${index + 1}: Missing 'slug'`);
//     }
//     if (!trek.title) {
//       throw new Error(`Trek ${index + 1}: Missing 'title'`);
//     }
//   });
// }

// // ==============================================
// // API METHODS
// // ==============================================

// /**
//  * Get all admin treks
//  */
// export async function getAdminTreks() {
//   // eslint-disable-next-line no-useless-catch
//   try {
//     const response = await adminApi.get("/treks-list/");
//     return response;
//   } catch (error) {
//     throw error;
//   }
// }

// /**
//  * Get single trek by slug
//  */
// export async function getAdminTrek(slug) {
//   // eslint-disable-next-line no-useless-catch
//   try {
//     const response = await adminApi.get(`/import/full/${slug}/`);
//     return response;
//   } catch (error) {
//     throw error;
//   }
// }

// /**
//  * Search treks by query
//  */
// export async function searchAdminTreks(query) {
//   // eslint-disable-next-line no-useless-catch
//   try {
//     const response = await adminApi.get(`/treks/`, { 
//       params: { search: query } 
//     });
//     return response;
//   } catch (error) {
//     throw error;
//   }
// }

// /**
//  * Delete trek by slug
//  */
// export async function deleteAdminTrek(slug) {
//   try {
//     const response = await adminApi.delete(`/import/full/${slug}/`);
//     return { success: true, data: response };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// }

// /**
//  * Import full trek data (single trek)
//  */
// export async function importFullTrek(payload) {
//   try {
//     validateImportPayload(payload);
//     const response = await adminApi.post("/import/full/", payload);
//     return response;
//   } catch (error) {
//     if (isDev) {
//       console.error("Import failed:", error.message);
//     }
//     throw error;
//   }
// }

// /**
//  * Update trek completely (PUT)
//  */
// export async function updateTrekFull(slug, payload) {
//   // eslint-disable-next-line no-useless-catch
//   try {
//     const response = await adminApi.put(`/import/full/${slug}/`, payload);
//     return response;
//   } catch (error) {
//     throw error;
//   }
// }

// /**
//  * Update trek partially (PATCH)
//  */
// export async function updateTrekPartial(slug, payload) {
//   // eslint-disable-next-line no-useless-catch
//   try {
//     const response = await adminApi.patch(`/import/full/${slug}/`, payload);
//     return response;
//   } catch (error) {
//     throw error;
//   }
// }

// /**
//  * Import multiple treks in bulk with progress tracking
//  */
// export async function importFullTreksBulk(importData, onProgress) {
//   const startTime = Date.now();
//   const treks = Array.isArray(importData) ? importData : importData.treks || [];
//   const total = treks.length;
  
//   const payload = importData.meta ? importData : {
//     meta: {
//       schema_version: "1.0",
//       mode: "replace_nested",
//       generated_by: "admin_panel",
//       generated_at: new Date().toISOString(),
//     },
//     regions: importData.regions || [],
//     treks: treks,
//   };

//   try {
//     if (onProgress) onProgress({ current: 0, total });
    
//     const response = await importFullTrek(payload);
    
//     if (onProgress) onProgress({ current: total, total });
    
//     const importResult = response.import_result || {};
//     const stats = importResult.stats || {};
//     const errors = importResult.errors || [];
//     const warnings = importResult.warnings || [];
//     const ok = importResult.ok !== undefined ? importResult.ok : true;
    
//     const isSuccess = ok && errors.length === 0;
    
//     const created = stats.treks_created || 0;
//     const updated = stats.treks_updated || 0;
//     const successCount = created + updated;
//     const failCount = isSuccess ? 0 : total - successCount;
    
//     const results = treks.map((trek, index) => {
//       const trekError = errors.find(e => 
//         e.trek === trek.slug || 
//         e.slug === trek.slug ||
//         e.index === index ||
//         e.field?.includes(trek.slug)
//       );
      
//       if (trekError) {
//         return {
//           trek: trek.title || trek.slug,
//           slug: trek.slug,
//           success: false,
//           message: trekError.message || trekError.error || trekError.detail || 'Import failed',
//         };
//       }
      
//       if (isSuccess || index < successCount) {
//         return {
//           trek: trek.title || trek.slug,
//           slug: trek.slug,
//           success: true,
//           message: created > 0 ? 'Created successfully' : 'Updated successfully',
//           action: created > 0 ? 'created' : 'updated',
//         };
//       }
      
//       return {
//         trek: trek.title || trek.slug,
//         slug: trek.slug,
//         success: false,
//         message: 'Import status unknown',
//       };
//     });
    
//     const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
//     // Only log summary in dev mode
//     if (isDev && enableDebugLogs) {
//       console.log(`✅ Import completed in ${duration}s:`, {
//         total,
//         success: successCount,
//         failed: failCount,
//         created,
//         updated
//       });
//     }
    
//     return {
//       success: isSuccess && failCount === 0,
//       results,
//       stats,
//       errors,
//       warnings,
//       successCount,
//       failCount,
//       duration,
//       importOk: ok,
//     };
    
//   } catch (error) {
//     const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
//     let errorDetails = [];
//     let errorMessage = error.message || 'Bulk import failed';
    
//     if (error.errors?.details) {
//       errorDetails = error.errors.details;
//     } else if (error.data?.import_result?.errors) {
//       errorDetails = error.data.import_result.errors;
//       errorMessage = errorDetails.map(e => e.message || e.error || e).join('; ');
//     } else if (error.data?.errors) {
//       const parsed = parseValidationErrors(error.data.errors);
//       errorDetails = parsed.details;
//       errorMessage = parsed.summary;
//     }
    
//     const results = treks.map((trek, index) => {
//       const specificError = errorDetails.find(e => 
//         e.field?.includes(String(index)) || 
//         e.field === trek.slug ||
//         e.trek === trek.slug ||
//         e.slug === trek.slug
//       );
      
//       return {
//         trek: trek.title || trek.slug || `Trek ${index + 1}`,
//         slug: trek.slug,
//         success: false,
//         message: specificError ? (specificError.message || specificError.error || specificError) : errorMessage,
//       };
//     });
    
//     return {
//       success: false,
//       results,
//       stats: {},
//       errors: errorDetails.length > 0 ? errorDetails : [{ message: errorMessage }],
//       warnings: [],
//       successCount: 0,
//       failCount: results.length,
//       duration,
//       importOk: false,
//     };
//   }
// }

// export default adminApi;



// // src/components/api/admin.api.js
// import axios from "axios";

// const ADMIN_API_BASE_URL = (
//   import.meta.env.VITE_ADMIN_API_BASE_URL || "http://127.0.0.1:8000/api/admin"
// ).replace(/\/$/, '');

// const isDev = import.meta.env.DEV;
// const enableDebugLogs = import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true' || false;

// // Token storage keys
// const ACCESS_TOKEN_KEY = "access_token";
// const REFRESH_TOKEN_KEY = "refresh_token";

// // Race condition prevention for token refresh
// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach(prom => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
  
//   failedQueue = [];
// };

// // API Logger - Only logs in development mode
// const apiLogger = {
//   request: (config) => {
//     if (isDev && enableDebugLogs) {
//       console.log(`🔵 ${config.method?.toUpperCase()} ${config.url}`);
//     }
//   },
//   response: (response) => {
//     if (isDev && enableDebugLogs) {
//       console.log(`✅ ${response.status} ${response.config.url}`);
//     }
//   },
//   error: (error) => {
//     // Always log errors, even in production
//     console.error(`❌ API Error: ${error.response?.status || 'ERR'}`, {
//       url: error.config?.url,
//       message: error.message,
//     });
    
//     // Detailed error only in dev
//     if (isDev) {
//       console.error('Error details:', error.response?.data);
//     }
//   }
// };

// // ==============================================
// // AUTH SERVICE - Token Management
// // ==============================================

// export const authService = {
//   /**
//    * Get access token from localStorage
//    */
//   getAccessToken: () => {
//     return localStorage.getItem(ACCESS_TOKEN_KEY);
//   },

//   /**
//    * Get refresh token from localStorage
//    */
//   getRefreshToken: () => {
//     return localStorage.getItem(REFRESH_TOKEN_KEY);
//   },

//   /**
//    * Set access token in localStorage
//    */
//   setAccessToken: (token) => {
//     if (token) {
//       localStorage.setItem(ACCESS_TOKEN_KEY, token);
//     } else {
//       localStorage.removeItem(ACCESS_TOKEN_KEY);
//     }
//   },

//   /**
//    * Set refresh token in localStorage
//    */
//   setRefreshToken: (token) => {
//     if (token) {
//       localStorage.setItem(REFRESH_TOKEN_KEY, token);
//     } else {
//       localStorage.removeItem(REFRESH_TOKEN_KEY);
//     }
//   },

//   /**
//    * Set both tokens
//    */
//   setTokens: (accessToken, refreshToken) => {
//     authService.setAccessToken(accessToken);
//     authService.setRefreshToken(refreshToken);
//   },

//   /**
//    * Clear all tokens
//    */
//   clearTokens: () => {
//     localStorage.removeItem(ACCESS_TOKEN_KEY);
//     localStorage.removeItem(REFRESH_TOKEN_KEY);
//   },

//   /**
//    * Check if user is authenticated
//    */
//   isAuthenticated: () => {
//     return !!authService.getAccessToken();
//   },

//   /**
//    * Refresh access token using refresh token
//    */
//   refreshAccessToken: async () => {
//     const refreshToken = authService.getRefreshToken();
    
//     if (!refreshToken) {
//       throw new Error('No refresh token available');
//     }

//     try {
//       const response = await axios.post(
//         `${ADMIN_API_BASE_URL}/auth/refresh/`,
//         { refresh: refreshToken },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           }
//         }
//       );

//       const newAccessToken = response.data?.access;
//       const newRefreshToken = response.data?.refresh;

//       if (!newAccessToken) {
//         throw new Error('No access token in refresh response');
//       }

//       authService.setAccessToken(newAccessToken);
      
//       // Update refresh token if provided (rotating refresh tokens)
//       if (newRefreshToken) {
//         authService.setRefreshToken(newRefreshToken);
//       }

//       return newAccessToken;
//     } catch (error) {
//       authService.clearTokens();
//       throw error;
//     }
//   },

//   /**
//    * Login with email and password
//    */
//   login: async (email, password) => {
//     try {
//       const response = await axios.post(
//         `${ADMIN_API_BASE_URL}/auth/login/`,
//         { email, password },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           }
//         }
//       );

//       const { access, refresh } = response.data;

//       if (access && refresh) {
//         authService.setTokens(access, refresh);
//       }

//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   },

//   /**
//    * Logout user
//    */
//   logout: async () => {
//     const refreshToken = authService.getRefreshToken();
    
//     try {
//       if (refreshToken) {
//         await axios.post(
//           `${ADMIN_API_BASE_URL}/auth/logout/`,
//           { refresh: refreshToken },
//           {
//             headers: {
//               'Content-Type': 'application/json',
//             }
//           }
//         );
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       authService.clearTokens();
//     }
//   },

//   /**
//    * Check current authentication status
//    */
//   checkAuth: async () => {
//     try {
//       const token = authService.getAccessToken();
      
//       if (!token) {
//         return false;
//       }

//       const response = await adminApi.get('/auth/me/');
//       return response;
//     } catch (error) {
//       authService.clearTokens();
//       return false;
//     }
//   }
// };

// // ==============================================
// // AXIOS INSTANCE
// // ==============================================

// const adminApi = axios.create({
//   baseURL: ADMIN_API_BASE_URL,
//   timeout: 60000,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });

// // ==============================================
// // REQUEST INTERCEPTOR
// // ==============================================

// adminApi.interceptors.request.use(
//   (config) => {
//     const token = authService.getAccessToken();
    
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }

//     apiLogger.request(config);
//     return config;
//   },
//   (error) => {
//     console.error('🔴 Request Error:', error);
//     return Promise.reject(error);
//   }
// );

// // ==============================================
// // RESPONSE INTERCEPTOR
// // ==============================================

// adminApi.interceptors.response.use(
//   (response) => {
//     apiLogger.response(response);
//     return response.data;
//   },
//   async (error) => {
//     const originalRequest = error.config;
    
//     // Handle 401 - Token expired or invalid
//     if (error.response?.status === 401 && !originalRequest._retry) {
      
//       // If already refreshing, queue this request
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then(token => {
//             originalRequest.headers['Authorization'] = `Bearer ${token}`;
//             return adminApi(originalRequest);
//           })
//           .catch(err => {
//             return Promise.reject(err);
//           });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         const newAccessToken = await authService.refreshAccessToken();
        
//         // Process all queued requests with new token
//         processQueue(null, newAccessToken);
        
//         // Retry the original request with new token
//         originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
//         return adminApi(originalRequest);
        
//       } catch (refreshError) {
//         processQueue(refreshError, null);
        
//         // Refresh failed - logout and redirect
//         await authService.logout();
        
//         if (typeof window !== 'undefined') {
//           window.location.href = '/login';
//         }
        
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }
    
//     // Handle other errors
//     apiLogger.error(error);
    
//     const status = error.response?.status;
//     const data = error.response?.data;
    
//     let message = 'Request failed';
//     let errors = null;
    
//     switch (status) {
//       case 400:
//         message = 'Invalid request data';
//         if (data?.import_result?.errors?.length > 0) {
//           errors = data.import_result.errors;
//           message = `Import errors: ${errors.map(e => e.message || e).join('; ')}`;
//         } else if (data?.errors) {
//           errors = parseValidationErrors(data.errors);
//           message = `Validation failed: ${errors.summary}`;
//         } else if (data?.detail) {
//           message = data.detail;
//         }
//         break;
        
//       case 403:
//         message = 'You do not have permission to perform this action';
//         if (data?.detail) {
//           message = data.detail;
//         }
//         break;
        
//       case 404:
//         message = 'Resource not found';
//         break;
        
//       case 413:
//         message = 'Payload too large. Try uploading fewer treks.';
//         break;
        
//       case 500:
//         message = 'Server error. Please try again.';
//         if (isDev && data?.detail) {
//           message += ` - ${data.detail}`;
//         }
//         break;
        
//       case 502:
//       case 503:
//       case 504:
//         message = 'Service temporarily unavailable. Please try again later.';
//         break;
        
//       default:
//         if (data?.detail) {
//           message = data.detail;
//         } else if (error.message) {
//           message = error.message;
//         }
//     }
    
//     // Handle network errors
//     if (error.code === 'ECONNABORTED') {
//       message = 'Request timeout. Try again or reduce data size.';
//     } else if (error.code === 'ERR_NETWORK') {
//       message = 'Cannot connect to server. Please check your connection.';
//     }
    
//     return Promise.reject({ 
//       status,
//       message,
//       data,
//       errors,
//       originalError: error
//     });
//   }
// );

// // ==============================================
// // HELPER FUNCTIONS
// // ==============================================

// function parseValidationErrors(errors) {
//   const details = [];
//   let summary = '';
  
//   if (Array.isArray(errors)) {
//     summary = errors.join('; ');
//     errors.forEach((err, idx) => {
//       details.push({ field: `Error ${idx + 1}`, message: err });
//     });
//   } else if (typeof errors === 'object') {
//     Object.entries(errors).forEach(([field, messages]) => {
//       const msgs = Array.isArray(messages) ? messages : [messages];
//       details.push({ field, message: msgs.join(', ') });
//     });
//     summary = details.map(d => `${d.field}: ${d.message}`).join('; ');
//   } else {
//     summary = String(errors);
//   }
  
//   return { summary, details };
// }

// function validateImportPayload(payload) {
//   if (!payload || typeof payload !== 'object') {
//     throw new Error("Invalid payload: Expected object");
//   }
  
//   if (!payload.meta) {
//     throw new Error("Invalid payload: Missing 'meta' field");
//   }
  
//   if (!payload.treks || !Array.isArray(payload.treks)) {
//     throw new Error("Invalid payload: 'treks' must be an array");
//   }
  
//   if (payload.treks.length === 0) {
//     throw new Error("Invalid payload: 'treks' array is empty");
//   }
  
//   payload.treks.forEach((trek, index) => {
//     if (!trek.slug) {
//       throw new Error(`Trek ${index + 1}: Missing 'slug'`);
//     }
//     if (!trek.title) {
//       throw new Error(`Trek ${index + 1}: Missing 'title'`);
//     }
//   });
// }

// // ==============================================
// // AUTHENTICATION API METHODS
// // ==============================================

// /**
//  * Login with email and password
//  */
// export async function adminLogin(email, password) {
//   return authService.login(email, password);
// }

// /**
//  * Logout current user
//  */
// export async function adminLogout() {
//   return authService.logout();
// }

// /**
//  * Check authentication status
//  */
// export async function checkAdminAuth() {
//   return authService.checkAuth();
// }

// // ==============================================
// // TREK API METHODS
// // ==============================================

// /**
//  * Get all admin treks
//  */
// export async function getAdminTreks() {
//   try {
//     const response = await adminApi.get("/treks-list/");
//     return response;
//   } catch (error) {
//     throw error;
//   }
// }

// /**
//  * Get single trek by slug
//  */
// export async function getAdminTrek(slug) {
//   try {
//     const response = await adminApi.get(`/import/full/${slug}/`);
//     return response;
//   } catch (error) {
//     throw error;
//   }
// }

// /**
//  * Search treks by query
//  */
// export async function searchAdminTreks(query) {
//   try {
//     const response = await adminApi.get(`/treks/`, { 
//       params: { search: query } 
//     });
//     return response;
//   } catch (error) {
//     throw error;
//   }
// }

// /**
//  * Delete trek by slug
//  */
// export async function deleteAdminTrek(slug) {
//   try {
//     const response = await adminApi.delete(`/import/full/${slug}/`);
//     return { success: true, data: response };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// }

// /**
//  * Import full trek data (single trek)
//  */
// export async function importFullTrek(payload) {
//   try {
//     validateImportPayload(payload);
//     const response = await adminApi.post("/import/full/", payload);
//     return response;
//   } catch (error) {
//     if (isDev) {
//       console.error("Import failed:", error.message);
//     }
//     throw error;
//   }
// }

// /**
//  * Update trek completely (PUT)
//  */
// export async function updateTrekFull(slug, payload) {
//   try {
//     const response = await adminApi.put(`/import/full/${slug}/`, payload);
//     return response;
//   } catch (error) {
//     throw error;
//   }
// }

// /**
//  * Update trek partially (PATCH)
//  */
// export async function updateTrekPartial(slug, payload) {
//   try {
//     const response = await adminApi.patch(`/import/full/${slug}/`, payload);
//     return response;
//   } catch (error) {
//     throw error;
//   }
// }

// /**
//  * Import multiple treks in bulk with progress tracking
//  */
// export async function importFullTreksBulk(importData, onProgress) {
//   const startTime = Date.now();
//   const treks = Array.isArray(importData) ? importData : importData.treks || [];
//   const total = treks.length;
  
//   const payload = importData.meta ? importData : {
//     meta: {
//       schema_version: "1.0",
//       mode: "replace_nested",
//       generated_by: "admin_panel",
//       generated_at: new Date().toISOString(),
//     },
//     regions: importData.regions || [],
//     treks: treks,
//   };

//   try {
//     if (onProgress) onProgress({ current: 0, total });
    
//     const response = await importFullTrek(payload);
    
//     if (onProgress) onProgress({ current: total, total });
    
//     const importResult = response.import_result || {};
//     const stats = importResult.stats || {};
//     const errors = importResult.errors || [];
//     const warnings = importResult.warnings || [];
//     const ok = importResult.ok !== undefined ? importResult.ok : true;
    
//     const isSuccess = ok && errors.length === 0;
    
//     const created = stats.treks_created || 0;
//     const updated = stats.treks_updated || 0;
//     const successCount = created + updated;
//     const failCount = isSuccess ? 0 : total - successCount;
    
//     const results = treks.map((trek, index) => {
//       const trekError = errors.find(e => 
//         e.trek === trek.slug || 
//         e.slug === trek.slug ||
//         e.index === index ||
//         e.field?.includes(trek.slug)
//       );
      
//       if (trekError) {
//         return {
//           trek: trek.title || trek.slug,
//           slug: trek.slug,
//           success: false,
//           message: trekError.message || trekError.error || trekError.detail || 'Import failed',
//         };
//       }
      
//       if (isSuccess || index < successCount) {
//         return {
//           trek: trek.title || trek.slug,
//           slug: trek.slug,
//           success: true,
//           message: created > 0 ? 'Created successfully' : 'Updated successfully',
//           action: created > 0 ? 'created' : 'updated',
//         };
//       }
      
//       return {
//         trek: trek.title || trek.slug,
//         slug: trek.slug,
//         success: false,
//         message: 'Import status unknown',
//       };
//     });
    
//     const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
//     // Only log summary in dev mode
//     if (isDev && enableDebugLogs) {
//       console.log(`✅ Import completed in ${duration}s:`, {
//         total,
//         success: successCount,
//         failed: failCount,
//         created,
//         updated
//       });
//     }
    
//     return {
//       success: isSuccess && failCount === 0,
//       results,
//       stats,
//       errors,
//       warnings,
//       successCount,
//       failCount,
//       duration,
//       importOk: ok,
//     };
    
//   } catch (error) {
//     const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
//     let errorDetails = [];
//     let errorMessage = error.message || 'Bulk import failed';
    
//     if (error.errors?.details) {
//       errorDetails = error.errors.details;
//     } else if (error.data?.import_result?.errors) {
//       errorDetails = error.data.import_result.errors;
//       errorMessage = errorDetails.map(e => e.message || e.error || e).join('; ');
//     } else if (error.data?.errors) {
//       const parsed = parseValidationErrors(error.data.errors);
//       errorDetails = parsed.details;
//       errorMessage = parsed.summary;
//     }
    
//     const results = treks.map((trek, index) => {
//       const specificError = errorDetails.find(e => 
//         e.field?.includes(String(index)) || 
//         e.field === trek.slug ||
//         e.trek === trek.slug ||
//         e.slug === trek.slug
//       );
      
//       return {
//         trek: trek.title || trek.slug || `Trek ${index + 1}`,
//         slug: trek.slug,
//         success: false,
//         message: specificError ? (specificError.message || specificError.error || specificError) : errorMessage,
//       };
//     });
    
//     return {
//       success: false,
//       results,
//       stats: {},
//       errors: errorDetails.length > 0 ? errorDetails : [{ message: errorMessage }],
//       warnings: [],
//       successCount: 0,
//       failCount: results.length,
//       duration,
//       importOk: false,
//     };
//   }
// }

// // ==============================================
// // BLOG API METHODS
// // ==============================================

// /**
//  * Get all blog posts
//  */
// export function getAdminBlogPosts(params = {}) {
//   return adminApi.get("/blog-posts/", { params });
// }

// /**
//  * Get single blog post by slug
//  */
// export function getAdminBlogPost(slug, params = {}) {
//   return adminApi.get(`/blog-posts/${slug}/`, { params });
// }

// /**
//  * Create new blog post
//  */
// export function createAdminBlogPost(payload) {
//   const isForm = payload instanceof FormData;
//   return adminApi.post("/blog-posts/", payload, {
//     headers: isForm ? { "Content-Type": "multipart/form-data" } : undefined,
//   });
// }

// /**
//  * Update blog post
//  */
// export function updateAdminBlogPost(slug, payload, params = {}) {
//   const isForm = payload instanceof FormData;
//   return adminApi.patch(`/blog-posts/${slug}/`, payload, {
//     params,
//     headers: isForm ? { "Content-Type": "multipart/form-data" } : undefined,
//   });
// }

// /**
//  * Delete blog post
//  */
// export function deleteAdminBlogPost(slug, params = {}) {
//   return adminApi.delete(`/blog-posts/${slug}/`, { params });
// }

// /**
//  * Get blog categories
//  */
// export function getAdminBlogCategories(params = {}) {
//   return adminApi.get("/blog-categories/", { params });
// }

// /**
//  * Get blog regions
//  */
// export function getAdminBlogRegions(params = {}) {
//   return adminApi.get("/blog-regions/", { params });
// }

// /**
//  * Get blog authors
//  */
// export function getAdminBlogAuthors(params = {}) {
//   return adminApi.get("/blog-authors/", { params });
// }

// /**
//  * Import blog posts
//  */
// export function importBlogPosts(payload) {
//   return adminApi.post("/blog/import/full/", payload);
// }

// /**
//  * Import/update blog post by slug
//  */
// export function importBlogPostBySlug(slug, payload, params = {}) {
//   return adminApi.patch(`/blog/import/full/${slug}/`, payload, { params });
// }

// export default adminApi;



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
    console.error("🔴 Request Error:", error);
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
    summary = errors.join("; ");
    errors.forEach((err, idx) => {
      details.push({ field: `Error ${idx + 1}`, message: err });
    });
  } else if (typeof errors === "object") {
    Object.entries(errors).forEach(([field, messages]) => {
      const msgs = Array.isArray(messages) ? messages : [messages];
      details.push({ field, message: msgs.join(", ") });
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

  if (!payload.treks || !Array.isArray(payload.treks)) {
    throw new Error("Invalid payload: 'treks' must be an array");
  }

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

    console.log("📤 Sending login payload:", { ...payload, password: "***hidden***" });

    const response = await axios.post(
      `${ADMIN_API_BASE_URL}/auth/login/`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("✅ Login response:", response.data);

    const { access, refresh, user } = response.data;
    if (access && refresh) {
      authService.setTokens(access, refresh, user);
    }

    return response.data;
  } catch (error) {
    console.error("❌ Full error object:", error.response?.data);
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
  return adminApi.get(`/import/full/${slug}/`);
}

export async function searchAdminTreks(query) {
  return adminApi.get(`/treks/`, {
    params: { search: query },
  });
}

export async function deleteAdminTrek(slug) {
  try {
    const response = await adminApi.delete(`/import/full/${slug}/`);
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: error.message };
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
