import { api } from '@/api/axios';
import { useQuery } from '@tanstack/react-query';

export function useMovementTypes() {
    return useQuery({
        queryKey: ['movementTypes'],
        queryFn: async () => {
            const response = await api.get('/movements/types');
            return response.data.data as string[];
        },
        staleTime: Infinity, // return from cache if the user does not leave the page
        gcTime: Infinity,
    });
}