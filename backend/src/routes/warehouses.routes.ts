import { FastifyInstance, FastifyRequest } from "fastify";
import prisma from "../lib/prisma";
import { IdentifierParam, PaginationParams, UpsertWarehouseBody } from "../types";

export default async function warehouseRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate);

    app.get('/', async (request: FastifyRequest<PaginationParams>, reply) => {
        const isAll = request.query.all === 'true';

        const page = Number(request.query.page) || 1;
        const limit = Number(request.query.limit) || 10;

        const skip = (page - 1) * limit;

        const [totalCount, warehouses] = await prisma.$transaction([
            prisma.warehouse.count({ where: { deletedAt: null } }),
            prisma.warehouse.findMany({
                skip: isAll ? undefined : skip,
                take: isAll ? undefined : limit,
                where: {
                    deletedAt: null
                },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return reply.send({
            success: true,
            data: warehouses,
            meta: isAll ? null : { total: totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) }
        });
    });

    app.post('/', async (request: FastifyRequest<{ Body: UpsertWarehouseBody }>, reply) => {
        if (request.user.role !== 'ADMIN') {
            return reply.status(403).send({ success: false, error: 'Forbidden: Admin access required to create a warehouse.' });
        }

        const { name, location } = request.body ?? {};
        const userId = request.user.id;

        if (!name) {
            return reply.status(400).send({ success: false, error: 'Warehouse name is required.' });
        }

        if (!location) {
            return reply.status(400).send({ success: false, error: 'Warehouse location is required.' });
        }

        const nameExists = await prisma.warehouse.findUnique({
            where: { name }
        });
        if (nameExists) {
            return reply.status(409).send({ success: false, error: 'A warehouse with this name already exists.' });
        }

        const newWarehouse = await prisma.warehouse.create({
            data: { name, location, createdById: userId }
        });

        return reply.status(201).send({ success: true, data: newWarehouse });
    });

    app.put('/:id', async (
        request: FastifyRequest<{ Params: IdentifierParam; Body: UpsertWarehouseBody }>,
        reply) => {
        if (request.user.role !== 'ADMIN') {
            return reply.status(403).send({ success: false, error: 'Forbidden: Admin access required to update a warehouse.' });
        }

        const { id } = request.params ?? {};
        const { name, location, active } = request.body ?? {};
        const userId = request.user.id;

        const existing = await prisma.warehouse.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
            return reply.status(404).send({ success: false, error: 'Warehouse not found.' });
        }

        if (name && name !== existing.name) {
            const nameConflict = await prisma.warehouse.findUnique({ where: { name } });
            if (nameConflict) {
                return reply.status(409).send({ success: false, error: 'A warehouse with this name already exists.' });
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

    app.delete('/:id', async (
        request: FastifyRequest<{ Params: IdentifierParam }>,
        reply) => {
        if (request.user.role !== 'ADMIN') {
            return reply.status(403).send({ success: false, error: 'Forbidden: Admin access required to delete a warehouse.' });
        }

        const { id } = request.params ?? {};
        const userId = request.user.id;

        const existing = await prisma.warehouse.findUnique({ where: { id } });
        if (!existing) {
            return reply.status(404).send({ success: false, error: 'Warehouse not found.' });
        }

        const activeStock = await prisma.stock.findFirst({
            where: {
                warehouseId: id,
                stockQuantity: { gt: 0 } // greater than
            }
        });

        if (activeStock) {
            return reply.status(400).send({
                success: false,
                error: 'Cannot delete warehouse. It still contains active stock. Please transfer or remove all items first.'
            });
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