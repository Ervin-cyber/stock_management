// backend/src/routes/dashboard.routes.ts
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import prisma from "../lib/prisma";

export default async function dashboardRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate);

    app.get('/stats', async (request: FastifyRequest, reply: FastifyReply) => {

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
            movementsLast7Days
        ] = await Promise.all([
            prisma.product.count({
                where: { deletedAt: null }
            }),
            prisma.warehouse.count({
                where: { deletedAt: null }
            }),
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
            })
        ]);

        const chartDataMap = new Map();

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' });
            chartDataMap.set(dateStr, { name: dateStr, IN: 0, OUT: 0 });
        }

        movementsLast7Days.forEach(mov => {
            const dateStr = new Date(mov.createdAt).toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' });
            if (chartDataMap.has(dateStr)) {
                const current = chartDataMap.get(dateStr);
                if (mov.movementType === 'IN') current.IN += mov.stockQuantity;
                if (mov.movementType === 'OUT') current.OUT += mov.stockQuantity;
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
                recentMovements
            }
        });
    });
}