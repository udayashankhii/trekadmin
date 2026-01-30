// admin/src/cloudinary/CloudinaryImport.js

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL || 'http://localhost:8000';

/**
 * Get auth token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem('access_token') || 
         localStorage.getItem('auth_token') ||     
         localStorage.getItem('adminToken') ||     
         localStorage.getItem('token');            
}

/**
 * Import Cloudinary image public IDs and link them to treks
 */
export default async function importCloudinaryImages(payload) {
  try {
    const token = getAuthToken();
    
    console.log('🔑 Auth token exists:', !!token);
    console.log('📤 Sending to:', `${API_BASE_URL}/treks/link-cloudinary-images/`);
    
    if (!token) {
      throw new Error('No authentication token. Please log in.');
    }
    
    // ✅ FIXED: Correct endpoint + trailing slash
    const response = await fetch(`${API_BASE_URL}/treks/link-cloudinary-images/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    console.log('📥 Status:', response.status);
    const data = await response.json();
    console.log('📦 Data:', data);

    if (response.status === 401) {
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorMsg = data.error || data.detail || `HTTP ${response.status}`;
      throw new Error(errorMsg);
    }

    console.log('✅ Success!');
    return data;
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

/**
 * Validate JSON structure
 */
export function validateCloudinaryJSON(data) {
  if (!Array.isArray(data)) return { valid: false, error: 'Must be array' };
  if (data.length === 0) return { valid: false, error: 'Array empty' };

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (!item.trek_slug) return { valid: false, error: `Item ${i+1}: Missing trek_slug` };
    if (!item.cloudinary_images) return { valid: false, error: `Item ${i+1}: Missing cloudinary_images` };
  }
  return { valid: true };
}
