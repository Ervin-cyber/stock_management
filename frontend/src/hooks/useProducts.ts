import { createProduct, deleteProduct, fetchProductDetails, fetchProducts, updateProduct } from "@/api/products.api";
import type { ProductFormValues } from "@/schemas/product.schema";
import type { FetchOptions } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useProducts = (options: FetchOptions = {}) => {
    const queryClient = useQueryClient();

    const productsQuery = useQuery({
        queryKey: ['products', options.all ? 'all' : options.page, options.search, options.sortBy, options.sortOrder],
        queryFn: () => fetchProducts(options),
    });

    const createMutation = useMutation({
        mutationFn: (data: ProductFormValues) => createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });

            toast.success('Successful operation!', {
                description: 'The product has been successfully added to the system.',
            });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error?.message|| 'The product could not be created.';
            toast.error('Error while saving!', {
                description: errorMessage,
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: ProductFormValues }) => updateProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });

            toast.success('Successful operation!', {
                description: 'The product has been successfully updated.',
            });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error?.message || 'The product could not be updated.';
            toast.error('Error while updating!', {
                description: errorMessage,
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id }: { id: string }) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });

            toast.success('Successful operation!', {
                description: 'The product has been successfully deleted.',
            });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error?.message || 'The product could not be deleted.';
            toast.error('Error while deleting!', {
                description: errorMessage,
            });
        }
    });

    return {
        products: productsQuery.data?.data || [],
        isLoading: productsQuery.isLoading,
        isErrored: productsQuery.isError,
        meta: productsQuery.data?.meta,

        createProduct: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        createError: createMutation.error,

        updateProduct: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,

        deleteProduct: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    }
}
export const useProductDetails = (productId: string | null) => {
    return useQuery({
        queryKey: ['product', productId],
        queryFn: () => productId ? fetchProductDetails(productId) : null,
        enabled: !!productId,
    });
};