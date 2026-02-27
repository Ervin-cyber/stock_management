import { createMovement, fetchMovements } from "@/api/movements.api";
import { fetchProducts } from "@/api/products.api";
import { fetchWarehouses } from "@/api/warehouses.api";
import type { MovementFormValues } from "@/schemas/movement.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const useMovements = () => {
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const limit = 10;

    const movementsQuery = useQuery({
        queryKey: ['movements', page],
        queryFn: () => fetchMovements(page, limit),
    });
    const productsQuery = useQuery({
        queryKey: ['products'],
        queryFn: () => fetchProducts(true)
    });
    const warehousesQuery = useQuery({
        queryKey: ['warehouses'],
        queryFn: () => fetchWarehouses(true)
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
        movements: movementsQuery.data?.data || [],
        isLoading: movementsQuery.isLoading,
        error: movementsQuery.error,
        meta: movementsQuery.data?.meta,
        page,
        setPage,

        products: productsQuery.data?.data || [],
        warehouses: warehousesQuery.data?.data || [],

        createMovement: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        createError: createMutation.error,
    }
}