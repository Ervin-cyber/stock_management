import type { WarehouseFormValues } from "@/schemas/warehouse.schema";
import type { Warehouse } from "@/types";
import { api } from "./axios";

export const fetchWarehouses = async (): Promise<Warehouse[]> => {
    const response = await api.get('/warehouses');
    return response.data?.data ?? [];
};

export const createWarehouse = async (data: WarehouseFormValues) => {
    const response = await api.post('/warehouses', data);
    return response.data;
};