import { FastifyInstance } from "fastify";
import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FetchQueryParamsSchema, IdentifierParamSchema, UpsertWarehouseBodySchema } from "../types";

export default async function warehouseRoutes(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    typedApp.addHook('onRequest', app.authenticate);

    typedApp.get('/', {
        schema: {
            description: '',
            tags: ['Warehouses'],
            security: [{ bearerAuth: [] }],
            querystring: FetchQueryParamsSchema
        },
    }, async (request, reply) => {
        const isAll = request.query.all === 'true';

        const page = Number(request.query.page) || 1;
        const limit = Number(request.query.limit) || 10;

        let orderByClause: any = { createdAt: 'desc' };

        const sortBy = request.query.sortBy;
        let sortOrder = 'desc';

        if (request.query.sortOrder && request.query.sortOrder.toLowerCase() === 'asc') {
            sortOrder = 'asc';
        }

        switch (sortBy) {
            case 'name':
                orderByClause = { name: sortOrder };
                break;
            case 'location':
                orderByClause = { location: sortOrder };
                break;
            case 'createdAt':
                orderByClause = { createdAt: sortOrder };
                break;
        }

        const skip = (page - 1) * limit;

        const [totalCount, warehouses] = await prisma.$transaction([
            prisma.warehouse.count({ where: { deletedAt: null } }),
            prisma.warehouse.findMany({
                skip: isAll ? undefined : skip,
                take: isAll ? undefined : limit,
                where: {
                    deletedAt: null
                },
                orderBy: orderByClause,
            })
        ]);

        return reply.send({
            success: true,
            data: warehouses,
            meta: isAll ? null : { total: totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) }
        });
    });

    typedApp.post('/', {
        schema: {
            description: 'Insert',
            tags: ['Warehouses'],
            security: [{ bearerAuth: [] }],
            body: UpsertWarehouseBodySchema
        },
    }, async (request, reply) => {
        if (request.user.role !== 'ADMIN') {
            throw new AppError('Forbidden: Admin access required to create a warehouse.', 403);
        }

        const { name, location, active } = request.body ?? {};
        const userId = request.user.id;

        if (!name) {
            throw new AppError('Warehouse name is required.', 400);
        }

        if (!location) {
            throw new AppError('Warehouse location is required.', 400);
        }

        const nameExists = await prisma.warehouse.findUnique({
            where: { name }
        });
        if (nameExists) {
            throw new AppError('A warehouse with this name already exists.', 409);
        }

        const newWarehouse = await prisma.warehouse.create({
            data: { name, location, createdById: userId }
        });

        return reply.status(201).send({ success: true, data: newWarehouse });
    });

    typedApp.put('/:id', {
        schema: {
            description: 'Update',
            tags: ['Warehouses'],
            security: [{ bearerAuth: [] }],
            params: IdentifierParamSchema,
            body: UpsertWarehouseBodySchema
        },
    }, async (
        request,
        reply) => {
        if (request.user.role !== 'ADMIN') {
            throw new AppError('Forbidden: Admin access required to update a warehouse.', 403);
        }

        const { id } = request.params ?? {};
        const { name, location, active } = request.body ?? {};
        const userId = request.user.id;

        const existing = await prisma.warehouse.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
            throw new AppError('Warehouse not found.', 404);
        }

        if (name && name !== existing.name) {
            const nameConflict = await prisma.warehouse.findUnique({ where: { name } });
            if (nameConflict) {
                throw new AppError('A warehouse with this name already exists.', 409);
            }
        }

        const updatedWarehouse = await prisma.warehouse.update({
            where: { id },
            data: {
                name,
                location,
                active: active ?? existing.active,
                updatedById: userId
            }
        });

        return reply.send({ success: true, data: updatedWarehouse });
    });

    typedApp.delete('/:id', {
        schema: {
            description: 'Delete',
            tags: ['Warehouses'],
            security: [{ bearerAuth: [] }],
            params: IdentifierParamSchema,
        },
    }, async (
        request,
        reply) => {
        if (request.user.role !== 'ADMIN') {
            throw new AppError('Forbidden: Admin access required to delete a warehouse.', 403);
        }

        const { id } = request.params ?? {};
        const userId = request.user.id;

        const existing = await prisma.warehouse.findUnique({ where: { id } });
        if (!existing) {
            throw new AppError('Warehouse not found.', 404);
        }

        const activeStock = await prisma.stock.findFirst({
            where: {
                warehouseId: id,
                stockQuantity: { gt: 0 } // greater than
            }
        });

        if (activeStock) {
            throw new AppError('Cannot delete warehouse. It still contains active stock. Please transfer or remove all items first.', 400);
        }

        await prisma.warehouse.update({ // soft delete
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedById: userId,
                active: false
            }
        });

        return reply.send({ success: true, message: 'Warehouse deleted successfully.' });
    });
}