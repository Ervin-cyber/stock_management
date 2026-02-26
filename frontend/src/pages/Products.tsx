import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/api/axios';
import { Package, Plus } from 'lucide-react';

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

interface Product {
    id: number;
    sku: string;
    name: string;
    description?: string;
    createdAt: string;
}

const productSchema = z.object({
    sku: z.string().min(3, { message: "SKU must be at least 3 characters." }),
    name: z.string().min(3, { message: "Name must be at least 3 characters." }),
    description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const fetchProducts = async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data.data ?? [];
};

const createProduct = async (data: ProductFormValues) => {
    const response = await api.post('/products', data);
    return response.data;
};

export default function Products() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: { sku: '', name: '', description: '' },
    });

    const { data: products, isLoading, isError } = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts,
    });

    const mutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setIsDialogOpen(false);
            form.reset();
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error || "An unexpected error occurred.";
            const statusCode = error.response?.status;

            if (statusCode === 409 || errorMessage.toLowerCase().includes('unique') || errorMessage.toLowerCase().includes('exist')) {
                form.setError('sku', {
                    type: 'server',
                    message: "This SKU is already taken.",
                });
            } else {
                form.setError('root', {
                    type: 'server',
                    message: errorMessage,
                });
            }
        }
    });

    const onSubmit = (data: ProductFormValues) => {
        mutation.mutate(data);
    };

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
                                        disabled={mutation.isPending}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {mutation.isPending ? "Saving..." : "Save Product"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <LoadingSpinner />
                ) : isError ? (
                    <div className="p-8 text-center text-red-500">
                        Failed to load products. Please try again later.
                    </div>
                ) : products?.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No products found. Click "Add Product" to create one.
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[100px]">SKU</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
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
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}