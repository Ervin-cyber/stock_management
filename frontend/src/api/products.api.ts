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