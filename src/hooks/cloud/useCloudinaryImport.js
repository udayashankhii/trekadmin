// admin/src/hooks/cloud/useCloudinaryImport.js
import { useState, useCallback } from 'react';
import importCloudinaryImages, { validateCloudinaryJSON } from './CloudinaryImport';

export const useCloudinaryImport = () => {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const importImages = useCallback(async (jsonData) => {
    setImporting(true);
    setError(null);
    setResult(null);

    console.log('🚀 Starting Cloudinary import...');

    try {
      // Parse JSON if it's a string
      const payload = typeof jsonData === 'string' 
        ? JSON.parse(jsonData) 
        : jsonData;

      console.log('✅ Parsed payload:', payload);

      // Validate structure
      const validation = validateCloudinaryJSON(payload);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      console.log(`📊 Processing ${payload.length} trek(s)`);

      // Call API
      const response = await importCloudinaryImages(payload);
      
      console.log('✅ Backend response:', response);
      
      setResult(response);
      return {
        success: response.ok,
        data: response
      };
    } catch (err) {
      console.error('❌ Import error:', err);
      const errorMessage = err.message || 'Failed to import images';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setImporting(false);
      console.log('🏁 Import process completed');
    }
  }, []);

  const clearResults = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    importing,
    result,
    error,
    importImages,
    clearResults
  };
};
