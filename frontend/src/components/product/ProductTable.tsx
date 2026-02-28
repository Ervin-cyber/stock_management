import LoadingSpinner from '@/components/LoadingSpinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/utils/formatter';
import SortableTableHead from '@/components/SortableTableHead';
import ActionTooltip from '../ActionTooltip';
import { Button } from '../ui/button';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { DataTableProps, Product } from '@/types';

export default function ProductTable({
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
}: DataTableProps<Product>) {

    if (isLoading) {
        return <div className="h-64 flex items-center justify-center border rounded-md"><LoadingSpinner /></div>;
    }

    if (isErrored) {
        return <div className="p-8 text-center text-red-500">
            Failed to load products. Please try again later.
        </div>
    }

    if (items.length === 0) {
        return <div className="text-center p-8 border rounded-md text-slate-500 bg-white">No products found. Click "Add Product" to create one.</div>;
    }

    return (
        <Table>
            <TableHeader className="bg-slate-50">
                <TableRow>
                    <SortableTableHead
                        label="SKU"
                        column="sku"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={onSort}
                    />
                    <SortableTableHead
                        label="Name"
                        column="name"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={onSort}
                    />
                    <SortableTableHead
                        label="Description"
                        column="description"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={onSort}
                    />
                    <SortableTableHead
                        align="center"
                        label="Created Date"
                        column="createdAt"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={onSort}
                    />
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items?.map((product) => (
                    <TableRow key={product.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-slate-900">
                            {product?.sku}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-700">
                            {product?.name}
                        </TableCell>
                        <TableCell className="text-slate-500 truncate max-w-[200px]">
                            {product.description || '-'}
                        </TableCell>
                        <TableCell className="text-center text-slate-500 w-[130px]">
                            {formatDate(product.createdAt)}
                        </TableCell>
                        <TableCell className="text-right w-[130px]">
                            <div className="flex justify-end gap-2">
                                <ActionTooltip label="View Product Details">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onView?.(product.id)}
                                        className="cursor-pointer"
                                    >
                                        <Eye className="h-4 w-4 text-slate-600" />
                                    </Button>
                                </ActionTooltip>
                                <ActionTooltip label={!hasPermission ? "You do not have permission to edit" : "Edit product"}>
                                    <span className={!hasPermission ? "cursor-not-allowed" : ""}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit?.(product)}
                                            className="cursor-pointer"
                                            disabled={!hasPermission}
                                        >
                                            <Pencil className="h-4 w-4 text-blue-600" />
                                        </Button>
                                    </span>
                                </ActionTooltip>

                                <ActionTooltip label={!hasPermission ? "You do not have permission to delete" : "Delete product"}>
                                    <span className={!hasPermission ? "cursor-not-allowed" : ""}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete?.(product.id)}
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