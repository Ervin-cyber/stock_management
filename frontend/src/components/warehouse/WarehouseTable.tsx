import LoadingSpinner from '@/components/LoadingSpinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/utils/formatter';
import SortableTableHead from '@/components/SortableTableHead';
import ActionTooltip from '../ActionTooltip';
import { Button } from '../ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import type { DataTableProps, Warehouse } from '@/types';

export default function WarehouseTable({
    items,
    isLoading,
    isErrored,
    sortBy,
    sortOrder,
    onSort,
    onEdit,
    onDelete,
    hasPermission
}: DataTableProps<Warehouse>) {

    if (isLoading) {
        return <div className="h-64 flex items-center justify-center border rounded-md"><LoadingSpinner /></div>;
    }

    if (isErrored) {
        return <div className="p-8 text-center text-red-500">
            Failed to load warehouses. Please try again later.
        </div>
    }

    if (items.length === 0) {
        return <div className="text-center p-8 border rounded-md text-slate-500 bg-white">No warehouses found. Click "Add Warehouse" to create one.</div>;
    }

    return (
        <Table>
            <TableHeader className="bg-slate-50">
                <TableRow>
                    <SortableTableHead
                        label="Name"
                        column="name"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={onSort}
                    />
                    <SortableTableHead
                        label="Location"
                        column="location"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={onSort}
                    />
                    <SortableTableHead
                        label="Created Date"
                        column="createdAt"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={onSort}
                        align='center'
                    />
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items?.map((warehouse) => (
                    <TableRow key={warehouse.id} className="hover:bg-slate-50">
                        <TableCell className="font-semibold text-slate-900">
                            {warehouse.name}
                        </TableCell>
                        <TableCell>{warehouse.location}</TableCell>
                        <TableCell className="text-center text-slate-500 w-[130px]">
                            {formatDate(warehouse.createdAt)}
                        </TableCell>
                        <TableCell className="text-right w-[130px]">
                            <div className="flex justify-end gap-2">
                                <ActionTooltip label={!hasPermission ? "You do not have permission to edit" : "Edit warehouse"}>
                                    <span className={!hasPermission ? "cursor-not-allowed" : ""}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit?.(warehouse)}
                                            className="cursor-pointer"
                                            disabled={!hasPermission}
                                        >
                                            <Pencil className="h-4 w-4 text-blue-600" />
                                        </Button>
                                    </span>
                                </ActionTooltip>

                                <ActionTooltip label={!hasPermission ? "You do not have permission to delete" : "Delete warehouse"}>
                                    <span className={!hasPermission ? "cursor-not-allowed" : ""}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete?.(warehouse.id)}
                                            className="cursor-pointer"
                                            disabled={!hasPermission}
                                        >
                                            <Trash2 className="h-4 w-4 text-rose-600" />
                                        </Button>
                                    </span>
                                </ActionTooltip>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}