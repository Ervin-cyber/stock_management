import LoadingSpinner from '@/components/LoadingSpinner';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime, formatNumber } from '@/utils/formatter';
import SortableTableHead from '@/components/SortableTableHead';
import { ArrowDownRight, ArrowUpRight, RefreshCw } from 'lucide-react';
import type { DataTableProps, Movement } from '@/types';

export default function MovementTable({
    items,
    isLoading,
    isErrored,
    sortBy,
    sortOrder,
    onSort,
    onEdit,
    onDelete,
    onView,
    hasPermission
}: DataTableProps<Movement>) {

    if (isLoading) {
        return <div className="h-64 flex items-center justify-center border rounded-md"><LoadingSpinner /></div>;
    }

    if (isErrored) {
        return <div className="p-8 text-center text-red-500">
            Failed to load stock movements. Please try again later.
        </div>
    }

    if (items.length === 0) {
        return <div className="text-center p-8 border rounded-md text-slate-500 bg-white">No movements recorded yet.</div>;
    }

    return (
        <Table>
            <TableHeader className="bg-slate-50">
                <TableRow>
                    <SortableTableHead
                        className="w-[100px]"
                        label="Type"
                        column="type"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={onSort}
                    />
                    <SortableTableHead
                        label="Product"
                        column="product"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={onSort}
                    />
                    <SortableTableHead
                        label="Source"
                        column="source"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={onSort}
                    />
                    <SortableTableHead
                        label="Destination"
                        column="destination"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={onSort}
                    />
                    <SortableTableHead
                        align='right'
                        label="Qty"
                        column="qty"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={onSort}
                    />
                    <SortableTableHead
                        label="Reference"
                        column="reference"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={onSort}
                    />
                    <SortableTableHead
                        label="User"
                        column="user"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={onSort}
                    />
                    <SortableTableHead
                        align='right'
                        label="Date"
                        column="date"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={onSort}
                    />
                </TableRow>
            </TableHeader>
            <TableBody>
                {items?.map((movement) => (
                    <TableRow key={movement.id} className="hover:bg-slate-50">
                        <TableCell>
                            {movement.movementType === 'IN' && (
                                <div className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none flex items-center gap-1 w-[85px] justify-center">
                                    <ArrowDownRight className="h-8 w-5" /> IN
                                </div>
                            )}
                            {movement.movementType === 'OUT' && (
                                <div className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-none flex items-center gap-1 w-[85px] justify-center">
                                    <ArrowUpRight className="h-8 w-5" /> OUT
                                </div>
                            )}
                            {movement.movementType === 'TRANSFER' && (
                                <div className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none flex items-center gap-1 w-[85px] justify-center">
                                    <RefreshCw className="h-8 w-5" /> TRANS
                                </div>
                            )}
                        </TableCell>
                        <TableCell>
                            <div className="font-semibold text-slate-900">{movement.product?.name}</div>
                            <div className="text-xs text-slate-500">{movement.product?.sku}</div>
                        </TableCell>
                        <TableCell className="text-slate-600">{movement.sourceWarehouse?.name || '-'}</TableCell>
                        <TableCell className="text-slate-600">{movement.destinationWarehouse?.name || '-'}</TableCell>
                        <TableCell className="text-right font-bold text-slate-900">{formatNumber(movement.stockQuantity)}</TableCell>
                        <TableCell>
                            <div className="text-sm text-slate-900">{movement.reference || '-'}</div>
                            {movement.description && <div className="text-xs text-slate-500 truncate max-w-[150px]">{movement.description}</div>}
                        </TableCell>
                        <TableCell className="text-slate-600">{movement.createdBy?.name}</TableCell>
                        <TableCell className="text-right text-slate-500 text-sm">
                            {formatDateTime(movement.createdAt)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}