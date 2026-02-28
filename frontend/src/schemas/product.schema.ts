import * as z from 'zod';

export const productSchema = z.object({
    sku: z.string().min(3, { message: "SKU must be at least 3 characters." }),
    name: z.string().min(3, { message: "Name must be at least 3 characters." }),
    description: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;