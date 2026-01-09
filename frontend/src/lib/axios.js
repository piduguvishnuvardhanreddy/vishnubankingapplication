import axios from 'axios';

const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || '/api';
    // Ensure API URL ends with /api if it's a full URL
    if (url.startsWith('http') && !url.endsWith('/api')) {
        url = url.replace(/\/$/, '') + '/api';
    }
    return url;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error detailed:", error);
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        // Optionally trigger a toast here
        return Promise.reject({ ...error, message });
    }
);

export default api;
