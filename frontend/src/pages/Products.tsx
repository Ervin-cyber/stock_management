import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { productSchema, type ProductFormValues } from '@/schemas/product.schema';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types';
import ConfirmDialog from '@/components/ConfirmDialog';
import DataTablePagination from '@/components/DataTablePagination';
import ProductDetailSheet from '@/components/ProductDetailSheet';
import ActionTooltip from '@/components/ActionTooltip';
import { useDebounce } from '@/hooks/useDebounce';

export default function Products() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { products, meta, page, setPage, isLoading, isCreating, createProduct, productsError, updateProduct, isUpdating, updateError, deleteProduct, isDeleting, deleteError } = useProducts({ search: debouncedSearch });

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, setPage]);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: { sku: '', name: '', description: '' },
    });

    const onSubmit = async (data: ProductFormValues) => {
        try {
            if (editingProduct) {
                await updateProduct({ id: editingProduct.id, data });
            } else {
                await createProduct(data);
            }

            setIsDialogOpen(false);
            setEditingProduct(null);
            resetForm();
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "An unexpected error occurred.";

            form.setError('root', {
                type: 'server',
                message: errorMessage
            });
        }
    };

    const resetForm = () => {
        form.reset({ sku: '', name: '', description: '' });
    }

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

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Product</DialogTitle>
                            <DialogDescription>
                                Enter the product details below. The SKU must be unique.
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="sku"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SKU (Item Number)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. PRD-001" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Wireless Mouse" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Brief description..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {form.formState.errors.root && (
                                    <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md text-center">
                                        {form.formState.errors.root.message}
                                    </div>
                                )}

                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isCreating}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isCreating ? "Saving..." : "Save Product"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
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
                {isLoading ? (
                    <LoadingSpinner />
                ) : productsError ? (
                    <div className="p-8 text-center text-red-500">
                        Failed to load products. Please try again later.
                    </div>
                ) : products?.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No products found. Click "Add Product" to create one.
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-[100px]">SKU</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products?.map((product) => (
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
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <ActionTooltip label="View Product Details">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setSelectedProductId(product.id)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Eye className="h-4 w-4 text-slate-600" />
                                                    </Button>
                                                </ActionTooltip>
                                                <ActionTooltip label="Edit Product">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setEditingProduct(product);
                                                            form.reset({
                                                                sku: product.sku || '',
                                                                name: product.name || '',
                                                                description: product.description || ''
                                                            });
                                                            setIsDialogOpen(true);
                                                        }}
                                                        className="cursor-pointer"
                                                    >
                                                        <Pencil className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                </ActionTooltip>

                                                <ActionTooltip label="Delete Product">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setProductToDelete(product.id)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-rose-600" />
                                                    </Button>
                                                </ActionTooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <DataTablePagination
                            currentPage={page}
                            totalPages={meta?.totalPages || 1}
                            onPageChange={setPage}
                        />
                    </>
                )}
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