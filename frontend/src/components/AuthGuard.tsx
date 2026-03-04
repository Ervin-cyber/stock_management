import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/api/axios';
import { useQuery } from '@tanstack/react-query';

export default function AuthGuard() {
    const token = useAuthStore((state) => state.token);

    useQuery({
        queryKey: ['authUser'],
        queryFn: async () => {
            const response = await api.get('/auth/me');
            return response.data;
        },
        enabled: !!token,
        retry: false,
    });

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}