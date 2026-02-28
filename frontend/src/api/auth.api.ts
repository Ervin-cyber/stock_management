import { api } from "./axios";


export const registerUser = async (data: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
};

export const verifyEmailToken = async (token: string) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
};