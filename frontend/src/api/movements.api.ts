import type { Movement, MovementOptions, PaginatedResponse } from "@/types";
import { api } from "./axios";

export const fetchMovements = async (options: MovementOptions = {}): Promise<PaginatedResponse<Movement[]>> => {
    const params = new URLSearchParams(); //handle special characters
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.type && options.type !== 'ALL') params.append('type', options.type);
    if (options.sourceWarehouseId && options.sourceWarehouseId !== 'ALL') params.append('sourceWarehouseId', options.sourceWarehouseId);
    if (options.destinationWarehouseId && options.destinationWarehouseId !== 'ALL') params.append('destinationWarehouseId', options.destinationWarehouseId);
    if (options.search) params.append('search', options.search);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    const response = await api.get(`/movements?${params.toString()}`);
    return response.data;
}

export const createMovement = async (data: any) => {
    const response = await api.post('/movements', data);
    return response.data;
};