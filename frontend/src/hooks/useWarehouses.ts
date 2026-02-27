import { createWarehouse, deleteWarehouse, fetchWarehouses, updateWarehouse } from "@/api/warehouses.api";
import type { WarehouseFormValues } from "@/schemas/warehouse.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const useWarehouses = () => {
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const limit = 10;

    const warehousesQuery = useQuery({
        queryKey: ['warehouses', page],
        queryFn: () => fetchWarehouses(false, page, limit),
    });

    const createMutation = useMutation({
        mutationFn: (data: WarehouseFormValues) => createWarehouse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });

            toast.success('Successful operation!', {
                description: 'The warehouse has been successfully added to the system.',
            });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'The warehouse could not be created.';
            toast.error('Error while saving!', {
                description: errorMessage,
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: WarehouseFormValues }) => updateWarehouse(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });

            toast.success('Successful operation!', {
                description: 'The warehouse has been successfully updated.',
            });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'The warehouse could not be updated.';
            toast.error('Error while updating!', {
                description: errorMessage,
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id }: { id: string }) => deleteWarehouse(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });

            toast.success('Successful operation!', {
                description: 'The warehouse has been successfully deleted.',
            });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'The warehouse could not be deleted.';
            toast.error('Error while deleting!', {
                description: errorMessage,
            });
        }
    });

    return {
        warehouses: warehousesQuery.data?.data || [],
        isLoading: warehousesQuery.isLoading,
        warehousesError: warehousesQuery.error,
        meta: warehousesQuery.data?.meta,
        page,
        setPage,

        createWarehouse: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        createError: createMutation.error,

        updateWarehouse: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,

        deleteWarehouse: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}