import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response.status;
        const serverMessage = error.response.data?.error?.message;// || error.response.data?.message;

        const token = useAuthStore.getState()?.token;
        const originalRequestUrl = error.config?.url;
        if (error.response) {


            if (status === 401 && token && !originalRequestUrl?.includes('/login')) {
                useAuthStore.getState().logout();
                toast.error('The session has expired!', {
                    description: 'Please log in again to continue.',
                    duration: 8000,
                });
            } else if (status === 403) {

                toast.warning('No permission!', {
                    description: serverMessage || 'This operation requires administrator rights.',
                });

            } else if (status === 429) {

                toast.warning('Too many requests!', {
                    description: serverMessage || 'Too many requests!',
                });

            }
        } else if (error.request) {
            toast.error('Network error!', {
                description: 'Unable to connect to the server. Check your internet connection.',
            });
        }
        return Promise.reject(error);
    }
);