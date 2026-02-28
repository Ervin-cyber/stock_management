import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import type { EditDialogProps } from '@/types';
import { useMovementMutations } from '@/hooks/useMovements';
import { movementSchema, type MovementFormValues } from '@/schemas/movement.schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MovementDialog({ isOpen, onClose }: EditDialogProps) {
    const { createMovement, isCreating, products, warehouses } = useMovementMutations();

    const form = useForm<MovementFormValues>({
        resolver: zodResolver(movementSchema) as any,
        defaultValues: {
            movementType: 'IN',
            productId: '',
            sourceWarehouseId: undefined,
            destinationWarehouseId: undefined,
            stockQuantity: 1,
            reference: undefined,
            description: undefined
        },
    });

    const selectedType = form.watch('movementType');

    /*useEffect(() => {
        if (editingItem) {
            form.reset({
                name: editingItem.name || '',
                sku: editingItem.sku || '',
                description: editingItem.description || ''
            });
        } else {
            form.reset({ name: '', sku: '' });
        }
    }, [editingItem, form]);*/

    const onSubmit = async (data: MovementFormValues) => {
        try {
            await createMovement(data);

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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Record Stock Movement</DialogTitle>
                    <DialogDescription>
                        Add items (IN), remove items (OUT), or move them between warehouses (TRANSFER).
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="movementType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Movement Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="IN" className="text-emerald-600 font-medium">IN (Receive)</SelectItem>
                                                <SelectItem value="OUT" className="text-rose-600 font-medium">OUT (Dispatch)</SelectItem>
                                                <SelectItem value="TRANSFER" className="text-blue-600 font-medium">TRANSFER</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="stockQuantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="productId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a product" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {products?.map((p: any) => (
                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                    {p.sku} - {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {(selectedType === 'OUT' || selectedType === 'TRANSFER') && (
                                <FormField
                                    control={form.control}
                                    name="sourceWarehouseId"
                                    render={({ field }) => (
                                        <FormItem className={selectedType === 'OUT' ? 'col-span-2' : 'col-span-1'}>
                                            <FormLabel>Source (From)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select source" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {warehouses?.map((w: any) => (
                                                        <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {(selectedType === 'IN' || selectedType === 'TRANSFER') && (
                                <FormField
                                    control={form.control}
                                    name="destinationWarehouseId"
                                    render={({ field }) => (
                                        <FormItem className={selectedType === 'IN' ? 'col-span-2' : 'col-span-1'}>
                                            <FormLabel>Destination (To)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select destination" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {warehouses?.map((w: any) => (
                                                        <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="reference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reference</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. PO-123" {...field} />
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
                                        <FormLabel>Description / Notes</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Extra notes..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {form.formState.errors.root && (
                            <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md text-center">
                                {form.formState.errors.root.message}
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isCreating} className="bg-blue-600 hover:bg-blue-700">
                                {isCreating ? "Saving..." : "Record Movement"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}