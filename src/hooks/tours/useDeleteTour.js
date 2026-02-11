// // src/hooks/useDeleteTour.js
// import { useState, useCallback } from "react";
// import { deleteAdminTour } from "../../components/api/admin.api";

// export const useDeleteTour = () => {
//   const [deleting, setDeleting] = useState(false);
//   const [error, setError] = useState(null);

//   const deleteTour = useCallback(async (slug) => {
//     if (!slug) {
//       return { success: false, error: "Tour slug is required" };
//     }

//     console.log(`Deleting tour: ${slug}`);
//     setDeleting(true);
//     setError(null);

//     try {
//       const result = await deleteAdminTour(slug);

//       if (result.success) {
//         console.log(`Tour deleted successfully: ${slug}`);
//         return { success: true };
//       } else {
//         console.error(`Failed to delete tour: ${result.error}`);
//         setError(result.error);
//         return { success: false, error: result.error };
//       }
//     } catch (err) {
//       const errorMessage = err.message || "Failed to delete tour";
//       console.error(`Delete error: ${errorMessage}`);
//       setError(errorMessage);
//       return { success: false, error: errorMessage };
//     } finally {
//       setDeleting(false);
//     }
//   }, []);

//   return {
//     deleteTour,
//     deleting,
//     error,
//   };
// };





// src/hooks/tours/useDeleteTour.js
import { useState, useCallback } from "react";
import { deleteAdminTour } from "../../components/api/tours.api";

export const useDeleteTour = () => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deleteTour = useCallback(async (slug) => {
    if (!slug) {
      return { success: false, error: "Tour slug is required" };
    }

    console.log(`Deleting tour: ${slug}`);
    setDeleting(true);
    setError(null);

    try {
      const result = await deleteAdminTour(slug);

      if (result.success) {
        console.log(`Tour deleted successfully: ${slug}`);
        return { success: true };
      } else {
        console.error(`Failed to delete tour: ${result.error}`);
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to delete tour";
      console.error(`Delete error: ${errorMessage}`);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setDeleting(false);
    }
  }, []);

  return {
    deleteTour,
    deleting,
    error,
  };
};