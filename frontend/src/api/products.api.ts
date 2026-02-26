import type { Product } from "@/types";
import { api } from "./axios";
import type { ProductFormValues } from "@/schemas/product.schema";

export const fetchProducts = async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data.data ?? [];
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