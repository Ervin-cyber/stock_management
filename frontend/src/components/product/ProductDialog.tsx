import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { productSchema, type ProductFormValues } from '@/schemas/product.schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useProductMutations } from '@/hooks/useProducts';
import { useEffect } from 'react';
import type { EditDialogProps } from '@/types';

export default function ProductDialog({ isOpen, onClose, editingItem }: EditDialogProps) {
    const { createProduct, updateProduct, isCreating } = useProductMutations();

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: { sku: '', name: '', description: '' },
    });

    useEffect(() => {
        if (editingItem) {
            form.reset({ 
                name: editingItem.name || '', 
                sku: editingItem.sku || '',
                description: editingItem.description || ''
            });
        } else {
            form.reset({ name: '', sku: '' });
        }
    }, [editingItem, form]);

    const onSubmit = async (data: ProductFormValues) => {
        try {
            if (editingItem) {
                await updateProduct({ id: editingItem.id, data });
            } else {
                await createProduct(data);
            }

            onClose();
        } catch (error: any) {
            const errorMessage = error.response?.data?.error?.message || "An unexpected error occurred.";

            form.setError('root', {
                type: 'server',
                message: errorMessage
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editingItem != null ? 'Edit Product' : 'Add New Product'}</DialogTitle>
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
    )
}