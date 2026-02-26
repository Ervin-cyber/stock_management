import { createWarehouse, fetchWarehouses } from "@/api/warehouses.api";
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

    return {
        warehouses: warehousesQuery.data || [],
        isLoading: warehousesQuery.isLoading,
        error: warehousesQuery.error,
        
        createWarehouse: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        createError: createMutation.error,
    };
}