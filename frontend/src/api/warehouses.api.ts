import type { WarehouseFormValues } from "@/schemas/warehouse.schema";
import type { FetchOptions, PaginatedResponse, Warehouse } from "@/types";
import { api } from "./axios";

export const fetchWarehouses = async (options: FetchOptions = {}): Promise<PaginatedResponse<Warehouse[]>> => {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.all) params.append('all', options.all.toString());
    if (options.search) params.append('search', options.search);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    const response = await api.get(`/warehouses?${params.toString()}`);
    return response.data;
};

export const createWarehouse = async (data: WarehouseFormValues) => {
    const response = await api.post('/warehouses', data);
    return response.data;
};

export const updateWarehouse = async (id: string, data: WarehouseFormValues) => {
    const response = await api.put(`/warehouses/${id}`, data);
    return response.data;
};

export const deleteWarehouse = async (id: string) => {
    const response = await api.delete(`/warehouses/${id}`);
    return response.data;
};