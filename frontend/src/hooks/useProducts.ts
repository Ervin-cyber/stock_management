import { createProduct, deleteProduct, fetchProductDetails, fetchProducts, updateProduct } from "@/api/products.api";
import type { ProductFormValues } from "@/schemas/product.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const useProducts = () => {
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const limit = 10;

    const productsQuery = useQuery({
        queryKey: ['products', page],
        queryFn: () => fetchProducts(false, page, limit),
    });

    const createMutation = useMutation({
        mutationFn: (data: ProductFormValues) => createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: ProductFormValues }) => updateProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id }: { id: string }) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
    });

    return {
        products: productsQuery.data?.data || [],
        isLoading: productsQuery.isLoading,
        productsError: productsQuery.error,
        meta: productsQuery.data?.meta,
        page,
        setPage,

        createProduct: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        createError: createMutation.error,

        updateProduct: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        updateError: updateMutation.error,

        deleteProduct: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
        deleteError: deleteMutation.error,
    }
}
export const useProductDetails = (productId: string | null) => {
    return useQuery({
        queryKey: ['product', productId],
        queryFn: () => productId ? fetchProductDetails(productId) : null,
        enabled: !!productId,
    });
};