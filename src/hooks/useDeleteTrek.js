// src/hooks/useDeleteTrek.js
import { useState, useCallback } from 'react';
import { deleteAdminTrek } from '../components/api/admin.api';

export const useDeleteTrek = () => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deleteTrek = useCallback(async (slug) => {
    if (!slug) {
      return { success: false, error: 'Trek slug is required' };
    }

    console.log(`🗑️ Deleting trek: ${slug}`);
    setDeleting(true);
    setError(null);

    try {
      const result = await deleteAdminTrek(slug);
      
      if (result.success) {
        console.log(`✅ Trek deleted successfully: ${slug}`);
        return { success: true };
      } else {
        console.error(`❌ Failed to delete trek: ${result.error}`);
        setError(result.error);
        return { success: false, error: result.error };
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete trek';
      console.error(`❌ Delete error: ${errorMessage}`);
      setError(errorMessage);
      return { success: false, error: errorMessage };
      
    } finally {
      setDeleting(false);
    }
  }, []);

  return { deleteTrek, deleting, error };
};
