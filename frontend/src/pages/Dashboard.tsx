import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Package, Building2, AlertTriangle, ArrowDownRight, ArrowUpRight, RefreshCw, Activity, TrendingUp } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatDateTime, formatNumber } from '@/utils/formatter';
import { useDashboard } from '@/hooks/useDashboard';;
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Dashboard() {
    const { stats, isLoading, isErrored } = useDashboard();

    if (isLoading) {
        return (
            <LoadingSpinner />
        );
    }

    if (isErrored) {
        return (
            <div className="p-4 text-red-500 bg-red-50 rounded-md">
                Failed to load dashboard statistics.
            </div>
        );
    }
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <LayoutDashboard className="h-8 w-8 text-blue-600" />
                    Dashboard
                </h1>
                <p className="text-slate-500">Overview of the current status of the inventory.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:md:grid-cols-4 gap-6">
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
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-600">Today's Movements</CardTitle>
                        <Activity className="h-5 w-5 text-violet-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-800">{stats?.todayMovementsCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Transaction today</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

                <Card className="lg:col-span-2 shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-800">Traffic (Past 7 days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <RechartsTooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                                    <Bar dataKey="IN" name="IN (pcs)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                                    <Bar dataKey="OUT" name="OUT (pcs)" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={30} />
                                    <Bar dataKey="TRANSFER" name="TRANSFER (pcs)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-800">Recent transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                            {stats.recentMovements.length === 0 ? (
                                <div className="text-sm text-slate-500 text-center py-8">No data yet.</div>
                            ) : (
                                stats.recentMovements.map((mov: any) => (
                                    <div key={mov.id} className="flex items-start justify-between border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-800 line-clamp-1">{mov.product.name}</span>
                                            <span className="text-xs text-slate-500 mt-0.5">{formatDateTime(mov.createdAt)}</span>

                                            <div className="flex items-center gap-1 mt-1.5">
                                                {mov.movementType === 'IN' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 flex items-center"><ArrowDownRight className="w-3 h-3 mr-0.5" />IN</span>}
                                                {mov.movementType === 'OUT' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 flex items-center"><ArrowUpRight className="w-3 h-3 mr-0.5" />OUT</span>}
                                                {mov.movementType === 'TRANSFER' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 flex items-center"><RefreshCw className="w-3 h-3 mr-0.5" />TRANS</span>}
                                                <span className="text-xs font-medium text-slate-700">{mov.stockQuantity} pcs</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg text-slate-800">Critical Low Stock Items</CardTitle>
                            <p className="text-sm text-slate-500">Products with less than 10 items in stock</p>
                        </div>
                        <AlertTriangle className="h-5 w-5 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        {stats.lowStockDetails && stats.lowStockDetails.length > 0 ? (
                            <div className="rounded-md border max-h-[200px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product (SKU)</TableHead>
                                            <TableHead>Warehouse</TableHead>
                                            <TableHead className="text-right">Current Stock</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stats.lowStockDetails.map((stock: any) => (
                                            <TableRow key={`${stock.productId}-${stock.warehouseId}`}>
                                                <TableCell className="font-medium">
                                                    {stock.product.name}
                                                    <span className="ml-2 text-xs text-slate-400">({stock.product.sku})</span>
                                                </TableCell>
                                                <TableCell>{stock.warehouse.name}</TableCell>
                                                <TableCell className="text-right">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${stock.stockQuantity === 0
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                        {stock.stockQuantity} pcs
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Package className="h-10 w-10 text-emerald-200 mb-2" />
                                <p className="text-sm font-medium text-slate-600">All inventory levels are healthy</p>
                                <p className="text-xs text-slate-400">No products are currently running low on stock.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg text-slate-800">Top Moved Products</CardTitle>
                            <p className="text-sm text-slate-500">Most active items (IN, OUT, TRANSFER)</p>
                        </div>
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        {stats.topMovedProducts && stats.topMovedProducts.length > 0 ? (
                            <div className="rounded-md border max-h-[200px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product (SKU)</TableHead>
                                            <TableHead className="text-right">Total Movements</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stats.topMovedProducts.map((item: any) => (
                                            <TableRow key={item.productId}>
                                                <TableCell className="font-medium">
                                                    {item.productName}
                                                    <span className="ml-2 text-xs text-slate-400">({item.productSku})</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                                                        {item.totalQuantity} pcs
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Activity className="h-10 w-10 text-slate-200 mb-2" />
                                <p className="text-sm font-medium text-slate-600">No movement data yet</p>
                                <p className="text-xs text-slate-400">Record some IN/OUT transactions to see trends.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}