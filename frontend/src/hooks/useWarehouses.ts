import { createWarehouse, deleteWarehouse, fetchWarehouses, updateWarehouse } from "@/api/warehouses.api";
import type { WarehouseFormValues } from "@/schemas/warehouse.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useWarehouses = () => {
    const queryClient = useQueryClient();

    const warehousesQuery = useQuery({
        queryKey: ['warehouses'],
        queryFn: fetchWarehouses,
    });

    const createMutation = useMutation({
        mutationFn: (data: WarehouseFormValues) => createWarehouse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: WarehouseFormValues }) => updateWarehouse(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id }: { id: string }) => deleteWarehouse(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
    });

    return {
        warehouses: warehousesQuery.data || [],
        isLoading: warehousesQuery.isLoading,
        warehousesError: warehousesQuery.error,

        createWarehouse: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        createError: createMutation.error,

        updateWarehouse: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        updateError: updateMutation.error,

        deleteWarehouse: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
        deleteError: updateMutation.error,
    };
}