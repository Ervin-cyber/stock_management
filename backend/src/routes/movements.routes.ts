import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { CreateMovementBody, MovementsQueryParams } from "../types";

export default async function movementRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate);

    app.get('/', async (request: FastifyRequest<MovementsQueryParams>, reply: FastifyReply) => {
        const page = Number(request.query.page) || 1;
        const limit = Number(request.query.limit) || 10;

        const { type, sourceWarehouseId, destinationWarehouseId, search, startDate, endDate, sortBy } = request.query;

        const skip = (page - 1) * limit;

        let orderByClause: any = { createdAt: 'desc' };

        let sortOrder = 'desc';

        if (request.query.sortOrder && request.query.sortOrder.toLowerCase() === 'asc') {
            sortOrder = 'asc';
        }

        switch (sortBy) {
            case 'date':
                orderByClause = { createdAt: sortOrder };
                break;
            case 'type':
            case 'movementType':
                orderByClause = { movementType: sortOrder };
                break;
            case 'qty':
            case 'quantity':
                orderByClause = { stockQuantity: sortOrder };
                break;
            case 'reference':
                orderByClause = { reference: sortOrder };
                break;
            case 'product':
                orderByClause = { product: { name: sortOrder } };
                break;
            case 'source':
                orderByClause = { sourceWarehouse: { name: sortOrder } };
                break;
            case 'destination':
                orderByClause = { destinationWarehouse: { name: sortOrder } };
                break;
            case 'user':
                orderByClause = { createdBy: { name: sortOrder } };
                break;
        }

        const whereClause: any = {};

        if (type && type !== 'ALL') {
            whereClause.movementType = type;
        }

        if (sourceWarehouseId && sourceWarehouseId !== 'ALL') {
            whereClause.sourceWarehouseId = sourceWarehouseId;
        }

        if (destinationWarehouseId && destinationWarehouseId !== 'ALL') {
            whereClause.destinationWarehouseId = destinationWarehouseId;
        }

        if (sourceWarehouseId && destinationWarehouseId && sourceWarehouseId !== 'ALL' && destinationWarehouseId === sourceWarehouseId) throw new AppError('Destination must be different from source.');

        if (search) {
            whereClause.OR = [
                { reference: { contains: search, mode: 'insensitive' } },
                {
                    product: {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { sku: { contains: search, mode: 'insensitive' } }
                        ]
                    }
                }
            ];
        }

        if (startDate || endDate) {
            whereClause.createdAt = {};
            if (startDate) {
                whereClause.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
            }
            if (endDate) {
                whereClause.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
            }
        }

        const [totalCount, movements] = await prisma.$transaction([
            prisma.stockMovement.count({ where: whereClause }),
            prisma.stockMovement.findMany({
                orderBy: orderByClause,
                where: whereClause,
                skip: skip,
                take: limit,
                include: {
                    product: { select: { name: true, sku: true } },
                    sourceWarehouse: { select: { name: true } },
                    destinationWarehouse: { select: { name: true } },
                    createdBy: { select: { name: true } }
                }
            })
        ]);
        return reply.send({
            success: true,
            data: movements,
            meta: {
                total: totalCount,
                page: page,
                limit: limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    });

    app.post('/', async (request: FastifyRequest<{ Body: CreateMovementBody }>, reply: FastifyReply) => {
        if (request.user.role === 'VIEWER') {
            throw new AppError('Forbidden: Insufficient permissions.', 403);
        }

        let { productId, movementType, stockQuantity, sourceWarehouseId, destinationWarehouseId, description, reference } = request.body ?? {};
        const userId = request.user.id;

        //sanitization
        if (sourceWarehouseId === "") sourceWarehouseId = undefined;
        if (destinationWarehouseId === "") destinationWarehouseId = undefined;

        if (!productId || !movementType || !stockQuantity || stockQuantity <= 0) {
            throw new AppError('Invalid input data or quantity <= 0!', 400);
        }

        //fail fast
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product || product.deletedAt) {
            throw new AppError('Product not found.', 404);
        }
        if (sourceWarehouseId) {
            const sourceWarehouse = await prisma.warehouse.findUnique({ where: { id: sourceWarehouseId } });
            if (!sourceWarehouse) throw new AppError('Source warehouse not found.', 404);
        }
        if (destinationWarehouseId) {
            const destinationWarehouse = await prisma.warehouse.findUnique({ where: { id: destinationWarehouseId } });
            if (!destinationWarehouse) throw new AppError('Destination warehouse not found.', 404);
        }

        const result = await prisma.$transaction(async (tx) => {
            if (movementType === 'OUT' || movementType === 'TRANSFER') { //race condition Pessimistic Lock / Row Lock
                await tx.$executeRaw`SELECT * FROM "Stock" WHERE "productId" = ${productId} AND "warehouseId" = ${sourceWarehouseId} FOR UPDATE`;
            }

            if (movementType === 'IN') {
                if (!destinationWarehouseId) throw new AppError('Destination warehouse is required for IN movement.');

                await tx.stock.upsert({
                    where: {
                        warehouseId_productId: { warehouseId: destinationWarehouseId, productId: productId }
                    },
                    create: {
                        warehouseId: destinationWarehouseId,
                        productId: productId,
                        stockQuantity: stockQuantity
                    },
                    update: {
                        stockQuantity: { increment: stockQuantity }
                    }
                });
            } else if (movementType === 'OUT') {
                if (!sourceWarehouseId) throw new AppError('Source warehouse is required for OUT movement.');

                const currentStock = await tx.stock.findUnique({
                    where: { warehouseId_productId: { warehouseId: sourceWarehouseId, productId: productId } }
                });

                if (!currentStock || currentStock.stockQuantity < stockQuantity) {
                    throw new AppError('Insufficient stock in source warehouse.');
                }

                await tx.stock.update({
                    where: { warehouseId_productId: { warehouseId: sourceWarehouseId, productId: productId } },
                    data: { stockQuantity: { decrement: stockQuantity } }
                })
            }
            else if (movementType === 'TRANSFER') {
                if (!sourceWarehouseId || !destinationWarehouseId) throw new AppError('Source and Destination warehouse is required for TRANSFER movement.');

                if (sourceWarehouseId === destinationWarehouseId) throw new AppError('Destination must be different from source.');

                const currentStock = await tx.stock.findUnique({
                    where: { warehouseId_productId: { warehouseId: sourceWarehouseId, productId: productId } }
                });

                if (!currentStock || currentStock.stockQuantity < stockQuantity) {
                    throw new AppError('Insufficient stock in source warehouse.');
                }

                await tx.stock.update({
                    where: { warehouseId_productId: { warehouseId: sourceWarehouseId, productId: productId } },
                    data: { stockQuantity: { decrement: stockQuantity } }
                });

                await tx.stock.upsert({
                    where: { warehouseId_productId: { warehouseId: destinationWarehouseId, productId: productId } },
                    create: { warehouseId: destinationWarehouseId, productId: productId, stockQuantity: stockQuantity },
                    update: { stockQuantity: { increment: stockQuantity } }
                })
            }

            const movement = await tx.stockMovement.create({
                data: {
                    productId,
                    movementType,
                    sourceWarehouseId,
                    destinationWarehouseId,
                    stockQuantity,
                    createdById: userId,
                    description,
                    reference
                }
            })

            return movement;
        });

        return reply.status(201).send({ success: true, data: result });
    });
}