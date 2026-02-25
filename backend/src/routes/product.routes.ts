import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma';

interface CreateProductBody {
    sku: string;
    name: string;
}

interface UpdateProductBody {
    sku?: string;
    name?: string;
    active?: boolean;
}

interface ProductParams {
    id: string;
}

export default async function productRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate as any);

    app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
        const products = await prisma.product.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' }
        });
        return reply.send({ success: true, data: products });
    });

    app.post('/', async (
        request: FastifyRequest<{ Body: CreateProductBody }>,
        reply: FastifyReply
    ) => {
        if (request.user.role !== 'ADMIN') {
            return reply.status(403).send({ success: false, error: 'Forbidden: Admin access required.' });
        }

        const { sku, name } = request.body ?? {};

        if (!sku || !name) {
            return reply.status(400).send({ success: false, error: 'SKU and name are required.' });
        }

        const skuExists = await prisma.product.findUnique({ where: { sku } });
        if (skuExists) {
            return reply.status(409).send({ success: false, error: 'A product with this SKU already exists.' });
        }

        const newProduct = await prisma.product.create({
            data: { sku, name }
        });

        return reply.status(201).send({ success: true, data: newProduct });
    });

    app.put('/:id', async (
        request: FastifyRequest<{ Params: ProductParams; Body: UpdateProductBody }>,
        reply: FastifyReply
    ) => {
        if (request.user.role !== 'ADMIN') {
            return reply.status(403).send({ success: false, error: 'Forbidden: Admin access required.' });
        }

        const { id } = request.params ?? {};
        const { sku, name, active } = request.body ?? {};

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
                active: active ?? existing.active
            }
        });

        return reply.send({ success: true, data: updatedProduct });
    });

    app.delete('/:id', async (
        request: FastifyRequest<{ Params: ProductParams }>,
        reply: FastifyReply
    ) => {
        if (request.user.role !== 'ADMIN') {
            return reply.status(403).send({ success: false, error: 'Forbidden: Admin access required.' });
        }

        const { id } = request.params ?? {};

        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
            return reply.status(404).send({ success: false, error: 'Product not found.' });
        }

        await prisma.product.update({ // soft delete
            where: { id },
            data: {
                deletedAt: new Date(),
                active: false
            }
        });

        return reply.send({ success: true, message: 'Product deleted successfully.' });
    });
}