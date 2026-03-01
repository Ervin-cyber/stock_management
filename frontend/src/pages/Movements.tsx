import { useEffect, useState } from 'react';
import { ArrowRightLeft, Plus, Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMovements } from '@/hooks/useMovements';
import DataTablePagination from '@/components/DataTablePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthStore } from '@/store/authStore';
import ActionTooltip from '@/components/ActionTooltip';
import MovementDialog from '@/components/movement/MovementDialog';
import MovementTable from '@/components/movement/MovementTable';
import type { Warehouse } from '@/types';
import { useMovementTypes } from '@/hooks/useMovementTypes';

export default function Movements() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const [showFilters, setShowFilters] = useState(false);
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [sourceWarehouseFilter, setSourceWarehouseFilter] = useState('ALL');
    const [destinationWarehouseFilter, setDestinationWarehouseFilter] = useState('ALL');
    const [productSearch, setProductSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const debouncedProductSearch = useDebounce(productSearch, 500);

    const userRole = useAuthStore((state) => state.user?.role);
    const hasCreatePermission = userRole === 'ADMIN' || userRole === 'MANAGER';

    const { movements, meta, warehouses, isLoading, isErrored } = useMovements({
        page,
        type: typeFilter,
        sourceWarehouseId: sourceWarehouseFilter,
        destinationWarehouseId: destinationWarehouseFilter,
        search: debouncedProductSearch,
        startDate: startDate,
        endDate: endDate,
        sortBy,
        sortOrder
    });

    const { data: movementTypes = [] } = useMovementTypes();

    useEffect(() => {
        setPage(1);
    }, [typeFilter, sourceWarehouseFilter, destinationWarehouseFilter, debouncedProductSearch, startDate, endDate, sortBy, sortOrder]);

    const activeFiltersCount = [
        typeFilter !== 'ALL',
        sourceWarehouseFilter !== 'ALL',
        destinationWarehouseFilter !== 'ALL',
        startDate !== '',
        endDate !== ''
    ].filter(Boolean).length;

    const clearFilters = () => {
        setTypeFilter('ALL');
        setSourceWarehouseFilter('ALL');
        setDestinationWarehouseFilter('ALL');
        setStartDate('');
        setEndDate('');
        setProductSearch('');
    };

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const handleSourceChange = (val: string) => { // block source === destination 
        setSourceWarehouseFilter(val);
        if (val !== 'ALL' && val === destinationWarehouseFilter) {
            setDestinationWarehouseFilter('ALL');
        }
    };

    const handleDestinationChange = (val: string) => {
        setDestinationWarehouseFilter(val);
        if (val !== 'ALL' && val === sourceWarehouseFilter) {
            setSourceWarehouseFilter('ALL');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <ArrowRightLeft className="h-8 w-8 text-blue-600" />
                        Stock Movements
                    </h1>
                    <p className="text-slate-500">Record IN, OUT, and TRANSFER inventory transactions.</p>
                </div>

                <ActionTooltip label={!hasCreatePermission ? "You do not have permission to create" : ""} showTooltip={!hasCreatePermission}>
                    <span className={!hasCreatePermission ? "cursor-not-allowed" : ""}>
                        <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            onClick={() => setIsDialogOpen(true)}
                            disabled={!hasCreatePermission}
                        >
                            <Plus className="mr-2 h-4 w-4" /> New Movement
                        </Button>
                    </span>
                </ActionTooltip>

                <MovementDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    editingItem={null}
                />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="space-y-4 m-3">

                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <div className="relative flex-1 w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by Movement reference, Product name or SKU..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="pl-9 pr-9 bg-white"
                            />

                            {productSearch && (
                                <button
                                    type="button"
                                    onClick={() => setProductSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                variant={activeFiltersCount > 0 ? "default" : "outline"}
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex-1 sm:flex-none"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                                {activeFiltersCount > 0 && (
                                    <Badge variant="secondary" className="ml-2 bg-white/20 hover:bg-white/30 text-current border-none">
                                        {activeFiltersCount}
                                    </Badge>
                                )}
                            </Button>

                            {(activeFiltersCount > 0 || productSearch !== '') && (
                                <Button variant="ghost" onClick={clearFilters} className="text-slate-500 hover:text-rose-600 px-3">
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {showFilters && (
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 shadow-inner animate-in slide-in-from-top-2 duration-200">

                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Movement Type</label>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger><SelectValue placeholder="ALL Type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">ALL</SelectItem>
                                        {
                                            movementTypes?.map((movementType) =>
                                                <SelectItem value={movementType}>{movementType}</SelectItem>
                                            )
                                        }
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Source Warehouse</label>
                                <Select value={sourceWarehouseFilter} onValueChange={handleSourceChange}>
                                    <SelectTrigger><SelectValue placeholder="ALL" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">ALL</SelectItem>
                                        {warehouses.map((w: Warehouse) => (
                                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Destination Warehouse</label>
                                <Select value={destinationWarehouseFilter} onValueChange={handleDestinationChange}>
                                    <SelectTrigger><SelectValue placeholder="ALL" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">ALL</SelectItem>
                                        {warehouses.map((w: Warehouse) => (
                                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Date (From)</label>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white" />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Date (To)</label>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-white" />
                            </div>

                        </div>
                    )}
                </div>
                <MovementTable
                    items={movements}
                    isLoading={isLoading}
                    isErrored={isErrored}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    hasPermission={hasCreatePermission}
                />
                <DataTablePagination
                    currentPage={page}
                    totalPages={meta?.totalPages || 1}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
}