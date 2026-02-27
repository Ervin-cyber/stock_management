import type { PaginatedResponse, Product } from "@/types";
import { api } from "./axios";
import type { ProductFormValues } from "@/schemas/product.schema";

export const fetchProducts = async (all = false, page = 1, limit = 10): Promise<PaginatedResponse<Product[]>> => {
    const response = await api.get(`/products?page=${page}&limit=${limit}&all=${all}`);
    return response.data;
};

export const createProduct = async (data: ProductFormValues) => {
    const response = await api.post('/products', data);
    return response.data;
};

export const updateProduct = async (id: string, data: ProductFormValues) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
};

export const deleteProduct = async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};