import { useState, useCallback } from 'react';
import { getAdminTreks } from '../components/api/admin.api';

export const useTreks = () => {
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTreks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAdminTreks();
      const formatted = (Array.isArray(data) ? data : []).map((t) => ({
        id: t.id,
        name: t.title || "Untitled Trek",
        slug: t.slug || "",
        duration: t.duration || "N/A",
        difficulty: t.trip_grade || "N/A",
        price: t.base_price ? `$${parseFloat(t.base_price).toFixed(2)}` : "N/A",
        region: t.region_name || "N/A",
        bookings: t.bookings_count || "0",
        status: t.is_published ? "Published" : "Draft",
        rating: t.rating || "N/A",
        maxAltitude: t.max_altitude || "N/A",
      }));

      setTreks(formatted);
      return { success: true, count: formatted.length };
    } catch (err) {
      console.error("Failed to load treks:", err);
      setError(err.message || "Failed to load treks");
      setTreks([]);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { treks, loading, error, loadTreks };
};
