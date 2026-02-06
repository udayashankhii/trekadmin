// src/hooks/useTrekEdit.js
import { useState, useCallback } from 'react';
import { updateTrekFull, updateTrekPartial } from '../components/api/admin.api';

const isDev = import.meta.env.DEV;

export const useTrekEdit = () => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const updateTrek = useCallback(async (slug, payload, method = 'PATCH') => {
    setUpdating(true);
    setError(null);

    try {
      console.log(`🚀 [useTrekEdit] ${method} request for slug:`, slug);
      console.log('📦 [useTrekEdit] Payload:', JSON.stringify(payload, null, 2));

      let response;
      
      if (method === 'PUT') {
        response = await updateTrekFull(slug, payload);
      } else {
        response = await updateTrekPartial(slug, payload);
      }

      console.log('✅ [useTrekEdit] Success response:', response);

      const importResult = response.import_result || {};
      const stats = importResult.stats || {};
      const errors = importResult.errors || [];
      const warnings = importResult.warnings || [];
      const ok = importResult.ok !== undefined ? importResult.ok : true;

      if (!ok || errors.length > 0) {
        const errorMsg = errors.map(e => e.message || e).join('; ');
        console.error('❌ [useTrekEdit] Import not OK:', { ok, errors, errorMsg });
        throw new Error(errorMsg || 'Update failed');
      }

      return {
        success: true,
        data: response.trek,
        stats,
        warnings,
        errors: [] // Empty on success
      };

    } catch (err) {
      console.error('❌ [useTrekEdit] Catch block error:', err);
      
      // The adminApi interceptor formats errors as:
      // { status, message, data, errors, originalError }
      
      let errorMessage = err.message || 'Failed to update trek';
      let errorDetails = [];
      let errorWarnings = [];
      let errorStats = {};
      
      // Try to extract backend validation errors
      if (err.data) {
        console.log('🔍 [useTrekEdit] Error data:', err.data);
        
        const importResult = err.data.import_result || {};
        
        // Get errors from import_result
        if (importResult.errors && Array.isArray(importResult.errors)) {
          errorDetails = importResult.errors;
          console.log('📋 [useTrekEdit] Import errors:', errorDetails);
        }
        
        // Get warnings
        if (importResult.warnings && Array.isArray(importResult.warnings)) {
          errorWarnings = importResult.warnings;
        }
        
        // Get stats
        if (importResult.stats) {
          errorStats = importResult.stats;
        }
        
        // Get detailed error message
        if (importResult.errors && importResult.errors.length > 0) {
          errorMessage = importResult.errors
            .map(e => {
              if (typeof e === 'string') return e;
              return e.message || e.error || e.detail || JSON.stringify(e);
            })
            .join('; ');
        }
      }
      
      // Also check err.errors from interceptor
      if (err.errors && !errorDetails.length) {
        errorDetails = Array.isArray(err.errors) ? err.errors : [err.errors];
        console.log('📋 [useTrekEdit] Interceptor errors:', errorDetails);
      }
      
      console.error('💥 [useTrekEdit] Final error message:', errorMessage);
      console.error('💥 [useTrekEdit] Error details:', errorDetails);
      
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        errors: errorDetails,
        warnings: errorWarnings,
        stats: errorStats,
        rawError: err // Include full error for debugging
      };

    } finally {
      setUpdating(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    updateTrek,
    updating,
    error,
    clearError
  };
};
