// src/hooks/useTreks.js
import { useState, useCallback } from 'react';
import { getAdminTreks, getAdminTrek } from '../components/api/admin.api';

export const useTreks = () => {
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTreks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAdminTreks();
      
      // Transform API response to UI format
      const formatted = (Array.isArray(data) ? data : []).map((t) => ({
        id: t.id,
        name: t.title || "Untitled Trek",
        slug: t.slug || "",
        duration: t.duration || "N/A",
        difficulty: t.trip_grade || "N/A",
        // ⭐ FIX: Show "Loading..." initially, will be fetched separately
        price: "Loading...",
        region: t.region?.name || "N/A",
        bookings: "N/A",
        status: "Published",
        rating: t.rating || "N/A",
        maxAltitude: t.max_altitude || "N/A",
        reviews: t.reviews || 0,
      }));

      setTreks(formatted);
      
      // ⭐ FIX: Fetch prices in background for each trek
      fetchPricesForTreks(formatted);
      
      return { success: true, count: formatted.length };
      
    } catch (err) {
      console.error("Failed to load treks:", err);
      const errorMsg = err.message || "Failed to load treks";
      setError(errorMsg);
      setTreks([]);
      return { success: false, error: errorMsg };
      
    } finally {
      setLoading(false);
    }
  }, []);

  // ⭐ NEW: Fetch prices for all treks
  const fetchPricesForTreks = useCallback(async (treksList) => {
    
    // Fetch prices in batches to avoid overwhelming the server
    const batchSize = 5;
    for (let i = 0; i < treksList.length; i += batchSize) {
      const batch = treksList.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (trek) => {
          try {
            const fullTrek = await getAdminTrek(trek.slug);
            const basePrice = fullTrek.booking_card?.base_price;
            
            if (basePrice) {
              // Update the specific trek with the price
              setTreks((prevTreks) =>
                prevTreks.map((t) =>
                  t.slug === trek.slug
                    ? { ...t, price: `$${parseFloat(basePrice).toFixed(2)}` }
                    : t
                )
              );
            } else {
              // No price available
              setTreks((prevTreks) =>
                prevTreks.map((t) =>
                  t.slug === trek.slug ? { ...t, price: "N/A" } : t
                )
              );
            }
          } catch (error) {
            console.error(`Failed to fetch price for ${trek.slug}:`, error);
            setTreks((prevTreks) =>
              prevTreks.map((t) =>
                t.slug === trek.slug ? { ...t, price: "N/A" } : t
              )
            );
          }
        })
      );
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < treksList.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
  }, []);

  return { treks, loading, error, loadTreks };
};
