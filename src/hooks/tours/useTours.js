// // src/hooks/useTours.js
// import { useState, useCallback } from "react";
// import { getAdminToursList } from "../../components/api/admin.api";

// export const useTours = () => {
//   const [tours, setTours] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const loadTours = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await getAdminToursList();

//       // Transform API response to UI format
//       const formatted = Array.isArray(data)
//         ? data.map((t) => ({
//             id: t.id,
//             title: t.title || "Untitled Tour",
//             slug: t.slug,
//             location: t.location || "N/A",
//             duration: t.duration || "N/A",
//             difficulty: t.difficulty || "N/A",
//             price: t.price || t.base_price || null,
//             travel_style: t.travel_style || "General",
//             rating: t.rating || 0,
//             reviews_count: t.reviews_count || 0,
//             is_published: t.is_published || false,
//             activity: t.activity || "N/A",
//             max_altitude: t.max_altitude || "N/A",
//           }))
//         : [];

//       setTours(formatted);
//       return {
//         success: true,
//         count: formatted.length,
//       };
//     } catch (err) {
//       const errorMsg = err.message || "Failed to load tours";
//       setError(errorMsg);
//       setTours([]);
//       return {
//         success: false,
//         error: errorMsg,
//       };
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   return {
//     tours,
//     loading,
//     error,
//     loadTours,
//   };
// };

// src/hooks/tours/useTours.js
import { useState, useCallback } from "react";
import { getAdminToursList } from "../../components/api/tours.api";

export const useTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTours = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminToursList();

      // Transform API response to UI format
      const formatted = Array.isArray(data)
        ? data.map((t) => ({
            id: t.id,
            title: t.title || "Untitled Tour",
            slug: t.slug,
            location: t.location || "N/A",
            duration: t.duration || "N/A",
            difficulty: t.difficulty || "N/A",
            price: t.price || t.base_price || null,
            travel_style: t.travel_style || "General",
            rating: t.rating || 0,
            reviews_count: t.reviews_count || 0,
            is_published: t.is_published || false,
            activity: t.activity || "N/A",
            max_altitude: t.max_altitude || "N/A",
          }))
        : [];

      setTours(formatted);
      return {
        success: true,
        count: formatted.length,
      };
    } catch (err) {
      const errorMsg = err.message || "Failed to load tours";
      setError(errorMsg);
      setTours([]);
      return {
        success: false,
        error: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tours,
    loading,
    error,
    loadTours,
  };
};