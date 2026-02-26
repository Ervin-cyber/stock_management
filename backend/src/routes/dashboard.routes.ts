// backend/src/routes/dashboard.routes.ts
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import prisma from "../lib/prisma";

export default async function dashboardRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate as any);

    app.get('/stats', async (request: FastifyRequest, reply: FastifyReply) => {
        const totalProducts = await prisma.product.count({
            where: { deletedAt: null }
        });

        const totalWarehouses = await prisma.warehouse.count({
            where: { deletedAt: null }
        });

        const lowStockItems = await prisma.stock.count({
            where: {
                stockQuantity: {
                    lt: 10
                }
            }
        });

        return reply.send({
            success: true,
            data: {
                totalProducts,
                totalWarehouses,
                lowStockItems
            }
        });
    });
}