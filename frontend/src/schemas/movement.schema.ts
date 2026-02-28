import * as z from 'zod';

export const movementSchema = z.object({
    movementType: z.enum(['IN', 'OUT', 'TRANSFER'], { message: "Please select a movement type." }),
    productId: z.string().min(1, { message: "Please select a product." }),
    sourceWarehouseId: z.string().optional(),
    destinationWarehouseId: z.string().optional(),
    stockQuantity: z.coerce.number().min(1, { message: "Quantity must be at least 1." }),
    reference: z.string().optional(),
    description: z.string().optional(),
}).superRefine((data, ctx) => {
    if ((data.movementType === 'OUT' || data.movementType === 'TRANSFER') && !data.sourceWarehouseId) {
        ctx.addIssue({ path: ['sourceWarehouseId'], message: "Source warehouse is required.", code: z.ZodIssueCode.custom });
    }
    if ((data.movementType === 'IN' || data.movementType === 'TRANSFER') && !data.destinationWarehouseId) {
        ctx.addIssue({ path: ['destinationWarehouseId'], message: "Destination warehouse is required.", code: z.ZodIssueCode.custom });
    }
    if (data.movementType === 'TRANSFER' && data.sourceWarehouseId === data.destinationWarehouseId) {
        ctx.addIssue({ path: ['destinationWarehouseId'], message: "Destination must be different from source.", code: z.ZodIssueCode.custom });
    }
});

export type MovementFormValues = z.infer<typeof movementSchema>;