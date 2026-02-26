import { api } from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Building2, AlertTriangle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Stats } from '@/types';
import { formatNumber } from '@/utils/formatter';

const fetchDashboardStats = async (): Promise<Stats> => {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
};

export default function Dashboard() {
    const { data: stats, isLoading, isError } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: fetchDashboardStats,
    });

    if (isLoading) {
        return (
            <LoadingSpinner/>
        );
    }

    if (isError) {
        return (
            <div className="p-4 text-red-500 bg-red-50 rounded-md">
                Failed to load dashboard statistics.
            </div>
        );
    }
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500">Overview of the current status of the inventory.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Products</CardTitle>
                        <Package className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(stats?.totalProducts || 0)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Active Warehouses</CardTitle>
                        <Building2 className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(stats?.totalWarehouses || 0)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Low Stock</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">{formatNumber(stats?.lowStockItems || 0)} items</div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}