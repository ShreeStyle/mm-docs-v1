import { useState, useCallback, useEffect } from 'react';
import { api } from '../utils/api';

/**
 * Custom hook for the Agentic AI Layer in document forms.
 * Handles suggestions, dependencies, consistency, and learning.
 */
export const useFormIntelligence = (templateId, initialData = {}) => {
    const [suggestions, setSuggestions] = useState({});
    const [mismatches, setMismatches] = useState([]);
    const [isChecking, setIsChecking] = useState(false);

    // Fetch suggestions for a specific field
    const fetchSuggestions = useCallback(async (fieldName) => {
        try {
            const res = await api.get(`/autofill/suggestions?field=${fieldName}`);
            if (res.success) {
                setSuggestions(prev => ({
                    ...prev,
                    [fieldName]: res.suggestions
                }));
            }
        } catch (err) {
            console.error(`Failed to fetch suggestions for ${fieldName}:`, err);
        }
    }, []);

    // Fetch related data (Dependencies)
    const fetchRelatedData = useCallback(async (fieldName, value) => {
        try {
            const res = await api.get(`/autofill/related?field=${fieldName}&value=${value}`);
            if (res.success && res.relatedData) {
                return res.relatedData;
            }
        } catch (err) {
            console.error(`Failed to fetch related data for ${fieldName}:`, err);
        }
        return null;
    }, []);

    // Check consistency with profile
    const performConsistencyCheck = useCallback(async (formData) => {
        setIsChecking(true);
        try {
            const res = await api.post('/autofill/consistency', formData);
            if (res.success) {
                setMismatches(res.mismatches);
            }
        } catch (err) {
            console.error('Consistency check failed:', err);
        } finally {
            setIsChecking(false);
        }
    }, []);

    // Track usage (Learning)
    const trackUsage = useCallback(async (fieldName, value) => {
        if (!value || value.length < 3) return;
        try {
            await api.post('/autofill/track', { 
                field: fieldName, 
                value, 
                templateId 
            });
        } catch (err) {
            // Silently fail for tracking
        }
    }, [templateId]);

    return {
        suggestions,
        mismatches,
        isChecking,
        fetchSuggestions,
        fetchRelatedData,
        performConsistencyCheck,
        trackUsage,
        setMismatches
    };
};
