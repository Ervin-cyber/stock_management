import { useEffect, useState } from 'react';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWarehouses } from '@/hooks/useWarehouses';
import type { Warehouse } from '@/types';
import ConfirmDialog from '@/components/ConfirmDialog';
import DataTablePagination from '@/components/DataTablePagination';
import ActionTooltip from '@/components/ActionTooltip';
import { useAuthStore } from '@/store/authStore';
import WarehouseDialog from '@/components/warehouse/WarehouseDialog';
import WarehouseTable from '@/components/warehouse/WarehouseTable';

export default function Warehouses() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

    const [warehouseToDelete, setWarehouseToDelete] = useState<string | null>(null);

    const { warehouses, meta, isLoading, isErrored, deleteWarehouse, isDeleting } = useWarehouses({
        page,
        sortBy,
        sortOrder
    });

    useEffect(() => {
        setPage(1);
    }, [sortBy, sortOrder]);

    const userRole = useAuthStore((state) => state.user?.role);
    const isAdmin = userRole === 'ADMIN';

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const handleDelete = async () => {
        if (!warehouseToDelete) return;

        try {
            await deleteWarehouse({ id: warehouseToDelete });
            setWarehouseToDelete(null);
        } catch (error) {

            setWarehouseToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="h-8 w-8 text-blue-600" />
                        Warehouses
                    </h1>
                    <p className="text-slate-500">Manage your physical storage locations.</p>
                </div>

                <ActionTooltip label={!isAdmin ? "You do not have permission to create" : ""} showTooltip={!isAdmin}>
                    <span className={!isAdmin ? "cursor-not-allowed" : ""}>
                        <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            onClick={() => {
                                setEditingWarehouse(null);
                                setIsDialogOpen(true);
                            }}
                            disabled={!isAdmin}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Warehouse
                        </Button>
                    </span>
                </ActionTooltip>

                {isAdmin && (
                    <WarehouseDialog
                        isOpen={isDialogOpen}
                        onClose={() => setIsDialogOpen(false)}
                        editingItem={editingWarehouse} />
                )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <WarehouseTable
                    items={warehouses}
                    isLoading={isLoading}
                    isErrored={isErrored}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    onEdit={(warehouse) => {
                        setEditingWarehouse(warehouse);
                        setIsDialogOpen(true);
                    }}
                    onDelete={(id) => setWarehouseToDelete(id)}
                    hasPermission={isAdmin}
                />

                <DataTablePagination
                    currentPage={page}
                    totalPages={meta?.totalPages || 1}
                    onPageChange={setPage}
                />
            </div>
            <ConfirmDialog
                isOpen={!!warehouseToDelete}
                onClose={() => setWarehouseToDelete(null)}
                onConfirm={handleDelete}
                title="Delete this warehouse?"
                description="This operation cannot be undone."
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </div>
    );
}