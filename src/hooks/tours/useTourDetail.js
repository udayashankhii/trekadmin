// src/hooks/useTourDetail.js
import { useState, useCallback } from "react";
import { getAdminTour } from "../../components/api/admin.api";

export const useTourDetail = () => {
  const [tourData, setTourData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTourDetail = useCallback(async (slug) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminTour(slug);
      setTourData(data);

      return {
        success: true,
        data,
      };
    } catch (err) {
      const errorMsg = err.message || "Failed to load tour details";
      setError(errorMsg);

      return {
        success: false,
        error: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearTourDetail = useCallback(() => {
    setTourData(null);
    setError(null);
  }, []);

  return {
    tourData,
    loading,
    error,
    loadTourDetail,
    clearTourDetail,
  };
};