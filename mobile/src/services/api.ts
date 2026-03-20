import axios from 'axios';
import storage from './storage';
import { BASE_URL } from '../config';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor to add the auth token and log detailed request
api.interceptors.request.use(
    async (config) => {
        const token = await storage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.log('🚀 [API Request Detail]');
        console.log(`  Method: ${config.method?.toUpperCase()}`);
        console.log(`  URL: ${config.url}`);
        console.log('  Headers:', JSON.stringify(config.headers, null, 2));
        console.log('  Data:', JSON.stringify(config.data, null, 2) || 'N/A');

        return config;
    },
    (error) => {
        console.error('❌ [API Request Error]', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors globally and log detailed response
api.interceptors.response.use(
    (response) => {
        console.log('✅ [API Response Detail]');
        console.log(`  Status: ${response.status}`);
        console.log(`  URL: ${response.config.url}`);
        console.log('  Headers:', JSON.stringify(response.headers, null, 2));
        console.log('  Data:', JSON.stringify(response.data, null, 2));
        return response;
    },
    async (error) => {
        console.error('❌ [API Error Detail]');
        console.error(`  URL: ${error.config?.url}`);
        console.error(`  Status: ${error.response?.status}`);
        console.error('  Response Data:', JSON.stringify(error.response?.data, null, 2) || error.message);

        if (error.response) {
            if (error.response.status === 401) {
                await storage.removeItem('token');
            }
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    }
);

export default api;
