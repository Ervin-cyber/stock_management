import { createProduct, fetchProducts } from "@/api/products.api";
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

    return {
        products: productsQuery.data || [],
        isLoading: productsQuery.isLoading,
        error: productsQuery.error,

        createProduct: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        createError: createMutation.error,
    }
}