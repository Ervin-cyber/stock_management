import { createMovement, fetchMovements } from "@/api/movements.api";
import { fetchProducts } from "@/api/products.api";
import { fetchWarehouses } from "@/api/warehouses.api";
import type { MovementFormValues } from "@/schemas/movement.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useMovements = () => {
    const queryClient = useQueryClient();

    const movementsQuery = useQuery({
        queryKey: ['movements'],
        queryFn: fetchMovements
    });
    const productsQuery = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts
    });
    const warehousesQuery = useQuery({
        queryKey: ['warehouses'],
        queryFn: fetchWarehouses
    });

    const createMutation = useMutation({
        mutationFn: (data: MovementFormValues) => {
            const payload = {
                ...data,
                productId: data.productId,
                sourceWarehouseId: (data.movementType === 'OUT' || data.movementType === 'TRANSFER') && data.sourceWarehouseId
                    ? data.sourceWarehouseId : null,
                destinationWarehouseId: (data.movementType === 'IN' || data.movementType === 'TRANSFER') && data.destinationWarehouseId
                    ? data.destinationWarehouseId : null,
            };
            return createMovement(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['movements'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
    });

    return {
        movements: movementsQuery.data || [],
        isLoading: movementsQuery.isLoading,
        error: movementsQuery.error,

        products: productsQuery.data || [],
        warehouses: warehousesQuery.data || [],

        createMovement: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        createError: createMutation.error,
    }
}