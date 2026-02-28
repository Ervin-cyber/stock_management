import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function AdminGuard() {
    const user = useAuthStore((state) => state.user);

    if (!user || user.role !== 'ADMIN') {
        toast.error('Access denied', {
            description: 'This function requires administrator privileges.'
        });

        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}