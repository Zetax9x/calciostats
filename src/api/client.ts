import axios from 'axios';

const API_USER = import.meta.env.VITE_SOCCERSAPI_USER;
const API_TOKEN = import.meta.env.VITE_SOCCERSAPI_TOKEN;
// CORRECTING TO SOCCERSAPI BASE URL
// Using local proxy to avoid CORS
const SOCCERSAPI_BASE_URL = '/api';

if (!API_USER || !API_TOKEN) {
    console.warn('VITE_SOCCERSAPI_USER or VITE_SOCCERSAPI_TOKEN is missing in .env file');
}

export const apiClient = axios.create({
    baseURL: SOCCERSAPI_BASE_URL,
    timeout: 15000, // 15 seconds timeout
    params: {
        user: API_USER,
        token: API_TOKEN,
        t: 'json' // often required by soccersapi to ensure json
    }
});

apiClient.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);
