// src/hooks/useDeleteTrek.js
import { useState } from 'react';
import { deleteAdminTrek } from '../components/api/admin.api';

export const useDeleteTrek = () => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deleteTrek = async (slug) => {
    setDeleting(true);
    setError(null);

    try {
      await deleteAdminTrek(slug);
      console.log(`✅ Successfully deleted trek: ${slug}`);
      return { success: true, slug };
    } catch (err) {
      console.error(`❌ Failed to delete trek: ${slug}`, err);
      const errorMessage = err?.message || 'Failed to delete trek';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setDeleting(false);
    }
  };

  return { deleteTrek, deleting, error };
};
