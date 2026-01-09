import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
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
