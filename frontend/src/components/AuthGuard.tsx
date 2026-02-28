import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/api/axios';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export default function AuthGuard() {
    const { logout } = useAuthStore();
    const token = useAuthStore((state) => state.token);

    const { isError } = useQuery({
        queryKey: ['authUser'],
        queryFn: async () => {
            const response = await api.get('/auth/me');
            return response.data;
        },
        enabled: !!token,
        retry: false,
    });

    useEffect(() => {
        if (isError) {
            logout();
        }
    }, [isError, logout]);

    if (isError) {
        return <Navigate to="/login" replace />;
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}