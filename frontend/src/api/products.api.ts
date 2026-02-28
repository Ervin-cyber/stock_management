import type { FetchOptions, PaginatedResponse, Product } from "@/types";
import { api } from "./axios";
import type { ProductFormValues } from "@/schemas/product.schema";

export const fetchProducts = async (options: FetchOptions = {}): Promise<PaginatedResponse<Product[]>> => {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.all) params.append('all', options.all.toString());
    if (options.search) params.append('search', options.search);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
};

export const fetchProductDetails = async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
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