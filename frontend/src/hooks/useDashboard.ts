import { fetchDashboardStats } from '@/api/dashboard.api';
import { useQuery } from '@tanstack/react-query';

export const useDashboard = () => {
    const dashboardQuery =  useQuery({
        queryKey: ['dashboard'],
        queryFn: fetchDashboardStats,
    });

    return {
        stats: dashboardQuery.data || [],
        isLoading: dashboardQuery.isLoading,
        isErrored: dashboardQuery.isError 
    }
};