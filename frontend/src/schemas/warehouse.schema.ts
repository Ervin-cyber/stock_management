import * as z from 'zod';

export const warehouseSchema = z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters." }),
    location: z.string().min(3, { message: "Location must be at least 3 characters." }),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;