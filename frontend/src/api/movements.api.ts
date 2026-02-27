import type { Movement, MovementFilters, PaginatedResponse } from "@/types";
import { api } from "./axios";

export const fetchMovements = async (filters: MovementFilters = {}): Promise<PaginatedResponse<Movement[]>> => {
    const params = new URLSearchParams(); //handle special characters
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.type && filters.type !== 'ALL') params.append('type', filters.type);
    if (filters.sourceWarehouseId && filters.sourceWarehouseId !== 'ALL') params.append('sourceWarehouseId', filters.sourceWarehouseId);
    if (filters.destinationWarehouseId && filters.destinationWarehouseId !== 'ALL') params.append('destinationWarehouseId', filters.destinationWarehouseId);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    const response = await api.get(`/movements?${params.toString()}`);
    return response.data;
}

export const createMovement = async (data: any) => {
    const response = await api.post('/movements', data);
    return response.data;
};