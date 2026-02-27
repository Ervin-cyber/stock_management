import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { CreateMovementBody, PaginationParams } from "../types";

export default async function movementRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate);

    app.get('/', async (request: FastifyRequest<PaginationParams>, reply: FastifyReply) => {
        const page = Number(request.query.page) || 1;
        const limit = Number(request.query.limit) || 10;

        const skip = (page - 1) * limit;

        const [totalCount, movements] = await prisma.$transaction([
            prisma.stockMovement.count(),
            prisma.stockMovement.findMany({
                skip: skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
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
        try {
            if (request.user.role === 'VIEWER') {
                return reply.status(403).send({ success: false, error: 'Forbidden: Insufficient permissions.' });
            }

            let { productId, movementType, stockQuantity, sourceWarehouseId, destinationWarehouseId } = request.body ?? {};
            const userId = request.user.id;

            //sanitization
            if (sourceWarehouseId === "") sourceWarehouseId = undefined;
            if (destinationWarehouseId === "") destinationWarehouseId = undefined;

            if (!productId || !movementType || !stockQuantity || stockQuantity <= 0) {
                return reply.status(400).send({ success: false, error: 'Invalid input data or quantity <= 0!' });
            }

            //fail fast
            const product = await prisma.product.findUnique({ where: { id: productId } });
            if (!product || product.deletedAt) {
                return reply.status(404).send({ success: false, error: 'Product not found.' })
            }
            if (sourceWarehouseId) {
                const sourceWarehouse = await prisma.warehouse.findUnique({ where: { id: sourceWarehouseId } });
                if (!sourceWarehouse) return reply.status(404).send({ success: false, error: 'Source warehouse not found.' })
            }
            if (destinationWarehouseId) {
                const destinationWarehouse = await prisma.warehouse.findUnique({ where: { id: destinationWarehouseId } });
                if (!destinationWarehouse) return reply.status(404).send({ success: false, error: 'Destination warehouse not found.' })
            }

            const result = await prisma.$transaction(async (tx) => {
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
                        createdById: userId
                    }
                })

                return movement;
            });

            return reply.status(201).send({ success: true, data: result });
        } catch (error: any) {
            if (error instanceof AppError) {
                return reply.status(400).send({ success: false, error: error.message });
            }
            throw error;
        }
    });
}