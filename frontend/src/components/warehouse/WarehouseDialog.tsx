import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useEffect } from 'react';
import { useWarehouses } from '@/hooks/useWarehouses';
import { warehouseSchema, type WarehouseFormValues } from '@/schemas/warehouse.schema';
import type { EditDialogProps } from '@/types';

export default function WarehouseDialog({ isOpen, onClose, editingItem }: EditDialogProps) {
    const { createWarehouse, updateWarehouse, isCreating } = useWarehouses();

    // Form initialization
    const form = useForm<WarehouseFormValues>({
        resolver: zodResolver(warehouseSchema),
        defaultValues: { name: '', location: '' },
    });

    useEffect(() => {
        if (editingItem) {
            form.reset({
                name: editingItem.name || '',
                location: editingItem.location || ''
            });
        } else {
            form.reset({ name: '', location: '' });
        }
    }, [editingItem, form]);

    const onSubmit = async (data: WarehouseFormValues) => {
        try {
            if (editingItem) {
                await updateWarehouse({ id: editingItem.id, data });
            } else {
                await createWarehouse(data);
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
                    <DialogTitle>{editingItem != null ? 'Edit Warehouse' : 'Add New Warehouse'}</DialogTitle>
                    <DialogDescription>
                        Enter the details of the new storage location here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Warehouse Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Main Hub" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Budapest, District 9" {...field} />
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
                                {isCreating ? "Saving..." : "Save Warehouse"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}