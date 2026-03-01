import { api } from "./axios";

export const fetchUsers = async () => {
    const response = await api.get('/users');
    return response.data.data;
};

export const updateUser = async (id: string, data: { role?: string; active?: boolean }) => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data.data;
};