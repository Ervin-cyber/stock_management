import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightLeft, Plus, ArrowDownRight, ArrowUpRight, RefreshCw } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { movementSchema, type MovementFormValues } from '@/schemas/movement.schema';
import { useMovements } from '@/hooks/useMovements';
import { formatDateTime, formatNumber } from '@/utils/formatter';

export default function Movements() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { movements, products, warehouses, isLoading, isCreating, createMovement, error } = useMovements();

    const form = useForm<MovementFormValues>({
        resolver: zodResolver(movementSchema) as any,
        defaultValues: {
            movementType: 'IN',
            productId: '',
            sourceWarehouseId: '',
            destinationWarehouseId: '',
            stockQuantity: 1,
            reference: '',
            description: ''
        },
    });

    const selectedType = form.watch('movementType');

    const onSubmit = async (data: MovementFormValues) => {
        try {
            await createMovement(data);

            form.reset();
            setIsDialogOpen(false);
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "An unexpected error occurred.";

            form.setError('root', {
                type: 'server',
                message: errorMessage
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <ArrowRightLeft className="h-8 w-8 text-blue-600" />
                        Stock Movements
                    </h1>
                    <p className="text-slate-500">Record IN, OUT, and TRANSFER inventory transactions.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> New Movement
                        </Button>
                    </DialogTrigger>

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
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div className="p-8 text-center text-red-500">
                        Failed to load stock movements. Please try again later.
                    </div>
                ) : movements?.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No movements recorded yet.
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[100px]">Type</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {movements?.map((movement) => (
                                <TableRow key={movement.id} className="hover:bg-slate-50">
                                    <TableCell>
                                        {movement.movementType === 'IN' && (
                                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none flex items-center gap-1 w-[85px] justify-center">
                                                <ArrowDownRight className="h-3 w-3" /> IN
                                            </Badge>
                                        )}
                                        {movement.movementType === 'OUT' && (
                                            <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-none flex items-center gap-1 w-[85px] justify-center">
                                                <ArrowUpRight className="h-3 w-3" /> OUT
                                            </Badge>
                                        )}
                                        {movement.movementType === 'TRANSFER' && (
                                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none flex items-center gap-1 w-[85px] justify-center">
                                                <RefreshCw className="h-3 w-3" /> TRANS
                                            </Badge>
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
                )}
            </div>
        </div>
    );
}