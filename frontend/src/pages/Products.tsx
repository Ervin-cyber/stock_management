import { useEffect, useState } from 'react';
import { Package, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types';
import ConfirmDialog from '@/components/ConfirmDialog';
import ActionTooltip from '@/components/ActionTooltip';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthStore } from '@/store/authStore';
import ProductDetailSheet from '@/components/product/ProductDetailSheet';
import ProductTable from '@/components/product/ProductTable';
import DataTablePagination from '@/components/DataTablePagination';
import ProductDialog from '@/components/product/ProductDialog';

export default function Products() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const userRole = useAuthStore((state) => state.user?.role);
    const isAdmin = userRole === 'ADMIN';

    const { products, isLoading, isErrored, meta, deleteProduct, isDeleting } = useProducts({
        page,
        search: debouncedSearch,
        sortBy,
        sortOrder
    });

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, sortBy, sortOrder]);

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const handleDelete = async () => {
        if (!productToDelete) return;

        try {
            await deleteProduct({ id: productToDelete });
            setProductToDelete(null);
        } catch (error) {
            setProductToDelete(null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Package className="h-8 w-8 text-blue-600" />
                        Products
                    </h1>
                    <p className="text-slate-500">Manage your master product catalog and SKUs.</p>
                </div>
                <ActionTooltip label={!isAdmin ? "You do not have permission to create" : ""} showTooltip={!isAdmin}>
                    <span className={!isAdmin ? "cursor-not-allowed" : ""}>
                        <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            onClick={() => {
                                setEditingProduct(null);
                                setIsDialogOpen(true);
                            }}
                            disabled={!isAdmin}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </span>
                </ActionTooltip>
                {isAdmin && (
                    <ProductDialog
                        isOpen={isDialogOpen}
                        onClose={() => setIsDialogOpen(false)}
                        editingItem={editingProduct}
                    />
                )}
            </div>

            <div className="flex items-center w-full max-w-sm relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search Product by name, SKU or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <ProductTable
                    items={products}
                    isLoading={isLoading}
                    isErrored={isErrored}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    onEdit={(product) => {
                        setEditingProduct(product);
                        setIsDialogOpen(true);
                    }}
                    onDelete={(id) => setProductToDelete(id)}
                    onView={(id) => setSelectedProductId(id)}
                    hasPermission={isAdmin}
                />

                <DataTablePagination
                    currentPage={page}
                    totalPages={meta?.totalPages || 1}
                    onPageChange={setPage}
                />
            </div>

            <ConfirmDialog
                isOpen={!!productToDelete}
                onClose={() => setProductToDelete(null)}
                onConfirm={handleDelete}
                title="Delete this product?"
                description="This operation cannot be undone."
                confirmText="Delete"
                isLoading={isDeleting}
            />
            <ProductDetailSheet
                productId={selectedProductId}
                isOpen={!!selectedProductId}
                onClose={() => setSelectedProductId(null)}
            />
        </div>
    );
}