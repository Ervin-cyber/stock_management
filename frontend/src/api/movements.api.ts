import type { Movement, PaginatedResponse } from "@/types";
import { api } from "./axios";

export const fetchMovements = async (page = 1, limit = 10): Promise<PaginatedResponse<Movement[]>> => {
    const response = await api.get(`/movements?page=${page}&limit=${limit}`);
    return response.data;
}

export const createMovement = async (data: any) => {
    const response = await api.post('/movements', data);
    return response.data;
};