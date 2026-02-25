import { FastifyInstance } from "fastify";
import prisma from "../lib/prisma";

export default async function warehouseRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate as any);

    app.get('/', async (request, reply) => {
        const warehouses = await prisma.warehouse.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return reply.send({ success: true, data: warehouses });
    });

    app.post('/', async (request, reply) => {
        if (request.user.role !== 'ADMIN') {
            return reply.status(403).send({ success: false, error: 'Forbidden: Admin access required to create a warehouse.' });
        }

        const { name, location } = request.body as any ?? {};

        if (!name) {
            return reply.status(400).send({ success: false, error: 'Warehouse name is required.' });
        }

        const nameExists = await prisma.warehouse.findUnique({
            where: { name }
        });
        if (nameExists) {
            return reply.status(409).send({ success: false, error: 'A warehouse with this name already exists.' });
        }

        const newWarehouse = await prisma.warehouse.create({
            data: { name, location }
        });

        return reply.status(201).send({ success: true, data: newWarehouse });
    });

    app.put('/:id', async (request, reply) => {
        if (request.user.role !== 'ADMIN') {
            return reply.status(403).send({ success: false, error: 'Forbidden: Admin access required to update a warehouse.' });
        }

        const { id } = request.params as { id: string } ?? {};
        const { name, location } = request.body as any ?? {};

        const existing = await prisma.warehouse.findUnique({ where: { id } });
        if (!existing) {
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
            data: { name, location }
        });

        return reply.send({ success: true, data: updatedWarehouse });
    });

    app.delete('/:id', async (request, reply) => {
        if (request.user.role !== 'ADMIN') {
            return reply.status(403).send({ success: false, error: 'Forbidden: Admin access required to delete a warehouse.' });
        }

        const { id } = request.params as { id: string } ?? {};

        const existing = await prisma.warehouse.findUnique({ where: { id } });
        if (!existing) {
            return reply.status(404).send({ success: false, error: 'Warehouse not found.' });
        }

        await prisma.warehouse.delete({ where: { id } });

        return reply.send({ success: true, message: 'Warehouse deleted successfully.' });
    });
}