import type { WarehouseFormValues } from "@/schemas/warehouse.schema";
import type { PaginatedResponse, Warehouse } from "@/types";
import { api } from "./axios";

export const fetchWarehouses = async (all = false, page = 1, limit = 10): Promise<PaginatedResponse<Warehouse[]>> => {
    const response = await api.get(`/warehouses?page=${page}&limit=${limit}&all=${all}`);
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