import { useState, useCallback } from "react";
import adminApi from "../components/api/admin.api";

export const useDeleteTrek = () => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deleteTrek = useCallback(async (slug) => {
    setDeleting(true);
    setError(null);

    try {
      await adminApi.delete(`/treks/${slug}/`);
      return { success: true };
    } catch (err) {
      const message = err?.response?.data?.detail || err?.message || "Failed to delete trek";
      setError(message);
      return { success: false, error: message };
    } finally {
      setDeleting(false);
    }
  }, []);

  return { deleteTrek, deleting, error };
};
