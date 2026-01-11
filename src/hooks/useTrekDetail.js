// src/hooks/useTrekDetail.js
import { useState, useCallback } from 'react';
import { getAdminTrek } from '../components/api/admin.api';

export const useTrekDetail = () => {
  const [trekData, setTrekData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTrekDetail = useCallback(async (slug) => {
    if (!slug) {
      setError('Trek slug is required');
      return { success: false, error: 'Trek slug is required' };
    }

    setLoading(true);
    setError(null);
    setTrekData(null);

    try {
      const data = await getAdminTrek(slug);
      setTrekData(data);
      
      return { success: true, data };
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to load trek details';
      setError(errorMessage);
      
      return { success: false, error: errorMessage };
      
    } finally {
      setLoading(false);
    }
  }, []);

  const clearTrekDetail = useCallback(() => {
    setTrekData(null);
    setError(null);
  }, []);

  return {
    trekData,
    loading,
    error,
    loadTrekDetail,
    clearTrekDetail,
  };
};
