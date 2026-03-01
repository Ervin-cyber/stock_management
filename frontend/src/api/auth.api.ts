import { api } from "./axios";


export const registerUser = async (data: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
};

export const verifyEmailToken = async (token: string) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
};

export const forgotPassword = async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

export const resetPassword = async (data: any) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
};