import { FastifyInstance } from "fastify";
import prisma from "../lib/prisma";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export default async function dashboardRoutes(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    typedApp.addHook('onRequest', app.authenticate);

    typedApp.get('/stats', {
        schema: {
            description: 'Retrieve dashboard statistics',
            tags: ['Dashboard'],
            security: [{ bearerAuth: [] }]
        },
    }, async (request, reply) => {

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [
            totalProducts,
            totalWarehouses,
            lowStockItems,
            todayMovementsCount,
            recentMovements,
            movementsLast7Days,
            lowStockDetails,
            topMovements
        ] = await Promise.all([
            prisma.product.count({ where: { deletedAt: null } }),
            prisma.warehouse.count({ where: { deletedAt: null } }),
            prisma.stock.count({
                where: {
                    stockQuantity: { lt: 10 },
                    product: { deletedAt: null },
                    warehouse: { deletedAt: null }
                }
            }),
            prisma.stockMovement.count({
                where: { createdAt: { gte: todayStart } }
            }),
            prisma.stockMovement.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    product: { select: { name: true } },
                    sourceWarehouse: { select: { name: true } },
                    destinationWarehouse: { select: { name: true } }
                }
            }),
            prisma.stockMovement.findMany({
                where: { createdAt: { gte: sevenDaysAgo } },
                select: { createdAt: true, movementType: true, stockQuantity: true }
            }),
            prisma.stock.findMany({
                where: {
                    stockQuantity: { lt: 10 },
                    product: { deletedAt: null },
                    warehouse: { deletedAt: null }
                },
                take: 10,
                orderBy: { stockQuantity: 'asc' },
                include: {
                    product: { select: { name: true, sku: true } },
                    warehouse: { select: { name: true } }
                }
            }),

            prisma.stockMovement.groupBy({
                by: ['productId'],
                _sum: { stockQuantity: true },
                orderBy: { _sum: { stockQuantity: 'desc' } },
                take: 5
            })
        ]);

        const productIds = topMovements.map(m => m.productId);
        const productsForTop = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, sku: true }
        });

        const topMovedProducts = topMovements.map(mov => {
            const prod = productsForTop.find(p => p.id === mov.productId);
            return {
                productId: mov.productId,
                productName: prod?.name || 'Unknown Product',
                productSku: prod?.sku || 'Unknown SKU',
                totalQuantity: mov._sum.stockQuantity || 0
            };
        });

        const chartDataMap = new Map();

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' });
            chartDataMap.set(dateStr, { name: dateStr, IN: 0, OUT: 0, TRANSFER: 0 }); 
        }

        movementsLast7Days.forEach(mov => {
            const dateStr = new Date(mov.createdAt).toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' });
            if (chartDataMap.has(dateStr)) {
                const current = chartDataMap.get(dateStr);
                if (mov.movementType === 'IN') current.IN += mov.stockQuantity;
                if (mov.movementType === 'OUT') current.OUT += mov.stockQuantity;
                if (mov.movementType === 'TRANSFER') current.TRANSFER += mov.stockQuantity; 
            }
        });

        const chartData = Array.from(chartDataMap.values());

        return reply.send({
            success: true,
            data: {
                totalProducts,
                totalWarehouses,
                lowStockItems,
                todayMovementsCount,
                chartData,
                recentMovements,
                lowStockDetails,
                topMovedProducts
            }
        });
    });
}