// src/hooks/tours/useTourEdit.js
import { useState, useCallback } from 'react';
import { updateAdminTourFull, patchAdminTourFull } from '../../components/api/tours.api';

export const useTourEdit = () => {
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);

    const updateTour = useCallback(async (slug, payload, method = 'PATCH') => {
        setUpdating(true);
        setError(null);

        try {
            console.log(`🚀 [useTourEdit] ${method} request for slug:`, slug);

            let response;
            if (method === 'PUT') {
                response = await updateAdminTourFull(slug, payload);
            } else {
                response = await patchAdminTourFull(slug, payload);
            }

            console.log('✅ [useTourEdit] Success response:', response);

            if (!response.success && response.errors?.length > 0) {
                const errorMsg = response.errors.map(e => e.message || e.error || e).join('; ');
                throw new Error(errorMsg || response.error || 'Update failed');
            }

            return response;

        } catch (err) {
            console.error('❌ [useTourEdit] Error:', err);
            const errorMessage = err.message || 'Failed to update tour';
            setError(errorMessage);

            return {
                success: false,
                error: errorMessage,
                errors: err.errors || [],
            };

        } finally {
            setUpdating(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        updateTour,
        updating,
        error,
        clearError
    };
};
