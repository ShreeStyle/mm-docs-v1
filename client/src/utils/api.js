// Determine API base URL based on environment
const API_BASE_URL = import.meta.env.PROD 
    ? '/api'  // In production, use relative path (Vercel will handle routing)
    : 'http://localhost:5000/api';  // In development, use local server

const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // Try to parse JSON, but handle cases where it might not be JSON
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error('Non-JSON response:', text);
            data = { message: 'Server returned an invalid response' };
        }

        if (!response.ok) {
            // Handle token expiration
            if (response.status === 401 || response.status === 400) {
                console.warn('Authentication failed - token may be expired');
                // Clear invalid token
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Redirect to login if we're not already there
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

export const api = {
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
    post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

export default api;
