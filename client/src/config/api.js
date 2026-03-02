// API Configuration for different environments
export const API_BASE_URL = import.meta.env.PROD 
    ? '/api'  // Production: use relative path (Vercel routing)
    : 'http://localhost:5000/api';  // Development: use local server

export const BASE_URL = import.meta.env.PROD
    ? ''  // Production: use relative path
    : 'http://localhost:5000';  // Development: use local server

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
    // If endpoint already starts with /api, use BASE_URL
    if (endpoint.startsWith('/api')) {
        return `${BASE_URL}${endpoint}`;
    }
    // Otherwise, use API_BASE_URL
    return `${API_BASE_URL}${endpoint}`;
};

export default { API_BASE_URL, BASE_URL, getApiUrl };
