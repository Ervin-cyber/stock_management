import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma';
import { IdentifierParam, UpsertProductBody } from '../types';

export default async function productRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate);

    app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
        const products = await prisma.product.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' }
        });
        return reply.send({ success: true, data: products });
    });

    app.post('/', async (
        request: FastifyRequest<{ Body: UpsertProductBody }>,
        reply: FastifyReply
    ) => {
        if (request.user.role !== 'ADMIN') {
            return reply.status(403).send({ success: false, error: 'Forbidden: Admin access required.' });
        }

        const { sku, name, description } = request.body ?? {};
        const userId = request.user.id;

        if (!sku || !name) {
            return reply.status(400).send({ success: false, error: 'SKU and name are required.' });
        }

        const skuExists = await prisma.product.findUnique({ where: { sku } });
        if (skuExists) {
            return reply.status(409).send({ success: false, error: 'A product with this SKU already exists.' });
        }

        const newProduct = await prisma.product.create({
            data: { sku, name, description, createdById: userId }
        });

        return reply.status(201).send({ success: true, data: newProduct });
    });

    app.put('/:id', async (
        request: FastifyRequest<{ Params: IdentifierParam; Body: UpsertProductBody }>,
        reply: FastifyReply
    ) => {
        if (request.user.role !== 'ADMIN') {
            return reply.status(403).send({ success: false, error: 'Forbidden: Admin access required.' });
        }

        const { id } = request.params ?? {};
        const { sku, name, active } = request.body ?? {};
        const userId = request.user.id;

        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
            return reply.status(404).send({ success: false, error: 'Product not found.' });
        }

        if (sku && sku !== existing.sku) {
            const skuTaken = await prisma.product.findUnique({ where: { sku } });
            if (skuTaken) {
                return reply.status(409).send({ success: false, error: 'A product with this SKU already exists.' });
            }
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                sku: sku ?? existing.sku,
                name: name ?? existing.name,
                active: active ?? existing.active,
                updatedById: userId,
            }
        });

        return reply.send({ success: true, data: updatedProduct });
    });

    app.delete('/:id', async (
        request: FastifyRequest<{ Params: IdentifierParam }>,
        reply: FastifyReply
    ) => {
        if (request.user.role !== 'ADMIN') {
            return reply.status(403).send({ success: false, error: 'Forbidden: Admin access required.' });
        }

        const { id } = request.params ?? {};
        const userId = request.user.id;

        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
            return reply.status(404).send({ success: false, error: 'Product not found.' });
        }

        const activeStock = await prisma.stock.findFirst({
            where: {
                productId: id,
                stockQuantity: { gt: 0 } 
            }
        });

        if (activeStock) {
            return reply.status(400).send({ 
                success: false, 
                error: 'Cannot delete product. There is still active stock in one or more warehouses. Please remove all items first.' 
            });
        }

        await prisma.product.update({ // soft delete
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedById: userId,
                active: false
            }
        });

        return reply.send({ success: true, message: 'Product deleted successfully.' });
    });
}