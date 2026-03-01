import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { FetchQueryParamsSchema, IdentifierParamSchema, UpsertProductBodySchema } from '../types';

export default async function productRoutes(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    typedApp.addHook('onRequest', app.authenticate);

    typedApp.get('/', {
        schema: {
            description: '',
            tags: ['Products'],
            security: [{ bearerAuth: [] }],
            querystring: FetchQueryParamsSchema
        },
    }, async (request, reply) => {
        const isAll = request.query.all === 'true';

        const search = request.query.search;

        const page = Number(request.query.page) || 1;
        const limit = Number(request.query.limit) || 10;

        let orderByClause: any = { createdAt: 'desc' };

        const sortBy = request.query.sortBy;
        let sortOrder = 'desc';

        if (request.query.sortOrder && request.query.sortOrder.toLowerCase() === 'asc') {
            sortOrder = 'asc';
        }

        switch (sortBy) {
            case 'sku':
                orderByClause = { sku: sortOrder };
                break;
            case 'name':
                orderByClause = { name: sortOrder };
                break;
            case 'description':
                orderByClause = { description: sortOrder };
                break;
            case 'createdAt':
                orderByClause = { createdAt: sortOrder };
                break;
        }

        const skip = (page - 1) * limit;

        const whereClause: any = { deletedAt: null };

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [totalCount, products] = await prisma.$transaction([
            prisma.product.count({ where: whereClause }),
            prisma.product.findMany({
                where: whereClause,
                orderBy: orderByClause,
                skip: isAll ? undefined : skip,
                take: isAll ? undefined : limit,
            })
        ]);

        return reply.send({
            success: true,
            data: products,
            meta: isAll ? null : { total: totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) }
        });
    });

    typedApp.get('/:id', {
        schema: {
            description: 'Get Product',
            tags: ['Products'],
            security: [{ bearerAuth: [] }],
            params: IdentifierParamSchema
        },
    }, async (request, reply) => {
        const { id } = request.params ?? {};

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                stocks: {
                    include: {
                        warehouse: { select: { name: true, location: true } }
                    }
                },
                movements: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    include: {
                        sourceWarehouse: { select: { name: true } },
                        destinationWarehouse: { select: { name: true } },
                        createdBy: { select: { name: true } }
                    }
                }
            }
        });

        if (!product || product.deletedAt) {
            throw new AppError('Product not found.', 404);
        }

        return reply.send({ success: true, data: product });
    });


    typedApp.post('/', {
        schema: {
            description: 'Insert',
            tags: ['Products'],
            security: [{ bearerAuth: [] }],
            body: UpsertProductBodySchema,
        },
    }, async (request, reply) => {
        if (request.user.role !== 'ADMIN') {
            throw new AppError('Forbidden: Admin access required.', 403);
        }

        const { sku, name, description } = request.body ?? {};
        const userId = request.user.id;

        if (!sku || !name) {
            throw new AppError('SKU and name are required.', 400);
        }

        const skuExists = await prisma.product.findUnique({ where: { sku } });
        if (skuExists) {
            throw new AppError('A product with this SKU already exists.', 409);
        }

        const newProduct = await prisma.product.create({
            data: { sku, name, description, createdById: userId }
        });

        return reply.status(201).send({ success: true, data: newProduct });
    });

    typedApp.put('/:id', {
        schema: {
            description: 'Update',
            tags: ['Products'],
            security: [{ bearerAuth: [] }],
            params: IdentifierParamSchema,
            body: UpsertProductBodySchema,
        },
    }, async (request, reply) => {
        if (request.user.role !== 'ADMIN') {
            throw new AppError('Forbidden: Admin access required.', 403);
        }

        const { id } = request.params ?? {};
        const { sku, name, active } = request.body ?? {};
        const userId = request.user.id;

        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
            throw new AppError('Product not found.', 404);
        }

        if (sku && sku !== existing.sku) {
            const skuTaken = await prisma.product.findUnique({ where: { sku } });
            if (skuTaken) {
                throw new AppError('A product with this SKU already exists.', 409);
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

    typedApp.delete('/:id', {
        schema: {
            description: 'Delete',
            tags: ['Products'],
            security: [{ bearerAuth: [] }],
            params: IdentifierParamSchema
        },
    }, async (request, reply) => {
        if (request.user.role !== 'ADMIN') {
            throw new AppError('Forbidden: Admin access required.', 403);
        }

        const { id } = request.params ?? {};
        const userId = request.user.id;

        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
            throw new AppError('Product not found.', 404);
        }

        const activeStock = await prisma.stock.findFirst({
            where: {
                productId: id,
                stockQuantity: { gt: 0 }
            }
        });

        if (activeStock) {
            throw new AppError('Cannot delete product. There is still active stock in one or more warehouses. Please remove all items first.', 400);
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