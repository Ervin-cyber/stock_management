import { createProduct, deleteProduct, fetchProducts, updateProduct } from "@/api/products.api";
import type { ProductFormValues } from "@/schemas/product.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProducts = () => {
    const queryClient = useQueryClient();

    const productsQuery = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts,
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
        products: productsQuery.data || [],
        isLoading: productsQuery.isLoading,
        productsError: productsQuery.error,

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