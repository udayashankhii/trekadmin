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
      let response;
      
      if (method === 'PUT') {
        response = await updateTrekFull(slug, payload);
      } else {
        response = await updateTrekPartial(slug, payload);
      }

      const importResult = response.import_result || {};
      const stats = importResult.stats || {};
      const errors = importResult.errors || [];
      const warnings = importResult.warnings || [];
      const ok = importResult.ok !== undefined ? importResult.ok : true;

      if (!ok || errors.length > 0) {
        const errorMsg = errors.map(e => e.message || e).join('; ');
        throw new Error(errorMsg || 'Update failed');
      }

      return {
        success: true,
        data: response.trek,
        stats,
        warnings
      };

    } catch (err) {
      const errorMsg = err.message || 'Failed to update trek';
      setError(errorMsg);
      
      return {
        success: false,
        error: errorMsg
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
