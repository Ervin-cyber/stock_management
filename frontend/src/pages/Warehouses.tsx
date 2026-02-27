import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { warehouseSchema, type WarehouseFormValues } from '@/schemas/warehouse.schema';
import { useWarehouses } from '@/hooks/useWarehouses';
import { formatDate } from '@/utils/formatter';
import type { Warehouse } from '@/types';
import ConfirmDialog from '@/components/ConfirmDialog';
import DataTablePagination from '@/components/DataTablePagination';

export default function Warehouses() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

    const [warehouseToDelete, setWarehouseToDelete] = useState<string | null>(null);

    const { warehouses, meta, page, setPage, isLoading, isCreating, createWarehouse, warehousesError, updateWarehouse, isUpdating, updateError, deleteWarehouse, isDeleting, deleteError } = useWarehouses();

    // Form initialization
    const form = useForm<WarehouseFormValues>({
        resolver: zodResolver(warehouseSchema),
        defaultValues: { name: '', location: '' },
    });

    const onSubmit = async (data: WarehouseFormValues) => {
        try {
            if (editingWarehouse) {
                await updateWarehouse({ id: editingWarehouse.id, data });
            } else {
                await createWarehouse(data);
            }

            setIsDialogOpen(false);
            setEditingWarehouse(null);
            form.reset({ name: '', location: '' });
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "An unexpected error occurred.";

            form.setError('root', {
                type: 'server',
                message: errorMessage
            });
        }
    };

    const handleDelete = async () => {
        if (!warehouseToDelete) return;

        try {
            await deleteWarehouse({ id: warehouseToDelete });
            setWarehouseToDelete(null);
        } catch (error) {

            setWarehouseToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="h-8 w-8 text-blue-600" />
                        Warehouses
                    </h1>
                    <p className="text-slate-500">Manage your physical storage locations.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Warehouse
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Warehouse</DialogTitle>
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
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <LoadingSpinner />
                ) : warehousesError ? (
                    <div className="p-8 text-center text-red-500">
                        Failed to load warehouses. Please try again later.
                    </div>
                ) : warehouses?.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No warehouses found. Click "Add Warehouse" to create one.
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-20">ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead className="text-right">Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {warehouses?.map((warehouse) => (
                                    <TableRow key={warehouse.id} className="hover:bg-slate-50">
                                        <TableCell className="font-medium text-slate-500">
                                            #{warehouse.id}
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-900">
                                            {warehouse.name}
                                        </TableCell>
                                        <TableCell>{warehouse.location}</TableCell>
                                        <TableCell className="text-right text-slate-500">
                                            {formatDate(warehouse.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditingWarehouse(warehouse);
                                                        form.reset({
                                                            name: warehouse.name || '',
                                                            location: warehouse.location || ''
                                                        });
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4 text-blue-600" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setWarehouseToDelete(warehouse.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-rose-600" />
                                                </Button>
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
                isOpen={!!warehouseToDelete}
                onClose={() => setWarehouseToDelete(null)}
                onConfirm={handleDelete}
                title="Delete this warehouse?"
                description="This operation cannot be undone."
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </div>
    );
}