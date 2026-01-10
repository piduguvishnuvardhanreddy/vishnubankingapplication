import axios from 'axios';

const getBaseUrl = () => {
    // 1. If VITE_API_URL is defined (e.g. in Vercel env vars), use it.
    let url = import.meta.env.VITE_API_URL;

    // 2. If not defined, and we are in development, use local proxy.
    if (!url) {
        return '/api';
    }

    // 3. Normalization: Remove trailing slash
    url = url.replace(/\/$/, '');

    // 4. Append /api if not already present
    if (!url.endsWith('/api')) {
        url += '/api';
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

        let message = 'Something went wrong';
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            message = error.response.data.message || error.response.statusText;
            console.error("Server Error Response:", error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            message = 'No response from server. Please check your connection.';
        } else {
            // Something happened in setting up the request that triggered an Error
            message = error.message;
        }

        return Promise.reject({ ...error, message });
    }
);

export default api;
