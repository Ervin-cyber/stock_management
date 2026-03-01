import { z } from 'zod';
import { MovementType, Role } from '@prisma/client';

const ZodMovementType = z.nativeEnum(MovementType);
const ZodRole = z.nativeEnum(Role);

export const LoginBodySchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const RegisterBodySchema = z.object({
    name: z.string().min(2, "The name must be at least 2 characters long"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const VerifyEmailBodySchema = z.object({
    token: z.string().min(1, "The confirmation token is missing!"),
});

export const AdminUpdateUserBodySchema = z.object({
    role: ZodRole.optional(),
    active: z.boolean().optional(),
});

export const UpsertProductBodySchema = z.object({
    sku: z.string().min(3, "SKU must be at least 3 characters long"),
    name: z.string().min(2, "The name must be at least 2 characters long"),
    description: z.string().optional(),
    active: z.boolean().optional(),
});

export const UpsertWarehouseBodySchema = z.object({
    name: z.string().min(3, "The name must be at least 3 characters long"),
    location: z.string().min(3, "The location must be at least 3 characters long"),
    active: z.boolean().optional(),
});

export const IdentifierParamSchema = z.object({
    id: z.string().uuid("Invalid UUID format"),
});

export const FetchQueryParamsSchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    all: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const CreateMovementBodySchema = z.object({
    productId: z.string().uuid("Invalid product ID"),
    movementType: ZodMovementType,
    stockQuantity: z.number().int().positive("Quantity must be greater than 0"),
    sourceWarehouseId: z.string().uuid().nullish(),
    destinationWarehouseId: z.string().uuid().nullish(),
    description: z.string().optional(),
    reference: z.string().optional(),
});

export const MovementsQueryParamsSchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z.union([ZodMovementType, z.literal('ALL')]).optional(),
    sourceWarehouseId: z.string().uuid().nullish(),
    destinationWarehouseId: z.string().uuid().nullish(),
    search: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});