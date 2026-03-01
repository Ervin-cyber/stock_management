import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, updateUser } from '@/api/users.api';
import { toast } from 'sonner';

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });
};

export const useUserMutations = () => {
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { role?: string; active?: boolean } }) =>
            updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Successful modification', {
                description: `The user's information has been updated.`
            });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.error?.message || 'Error during modification';
            toast.error(`The user's information cannot be updated.`, { description: msg });
        }
    });

    return {
        updateUser: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
    };
};