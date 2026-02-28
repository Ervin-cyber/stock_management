import { createMovement, fetchMovements } from "@/api/movements.api";
import { fetchProducts } from "@/api/products.api";
import { fetchWarehouses } from "@/api/warehouses.api";
import type { MovementFormValues } from "@/schemas/movement.schema";
import type { MovementOptions } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useMovements = (options: MovementOptions = {}) => {
    const queryClient = useQueryClient();

    const movementsQuery = useQuery({
        queryKey: ['movements', options.page, options.type, options.sourceWarehouseId, options.destinationWarehouseId, options.search, options.startDate, options.endDate, options.sortBy, options.sortOrder],
        queryFn: () => fetchMovements(options),
    });
    const productsQuery = useQuery({
        queryKey: ['products'],
        queryFn: () => fetchProducts({ all: true })
    });
    const warehousesQuery = useQuery({
        queryKey: ['warehouses'],
        queryFn: () => fetchWarehouses({ all: true })
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

            toast.success('Successful operation!', {
                description: 'The stock movement has been successfully added to the system.',
            });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error?.message || 'The stock movement could not be created.';
            toast.error('Error while saving!', {
                description: errorMessage,
            });
        }
    });

    return {
        movements: movementsQuery.data?.data || [],
        isLoading: movementsQuery.isLoading,
        isErrored: movementsQuery.isError,
        meta: movementsQuery.data?.meta,

        products: productsQuery.data?.data || [],
        warehouses: warehousesQuery.data?.data || [],

        createMovement: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
    }
}