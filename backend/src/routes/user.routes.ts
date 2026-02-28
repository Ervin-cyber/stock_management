import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";

export default async function userRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate);

    const requireAdmin = async (request: FastifyRequest) => {
        if (request.user.role !== 'ADMIN') {
            throw new AppError('Forbidden: Admin access required.', 403);
        }
    };

    app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
        await requireAdmin(request);

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        return reply.send({ success: true, data: users });
    });

    app.patch('/:id', async (
        request: FastifyRequest<{ Params: { id: string }, Body: { role?: any, active?: boolean } }>, 
        reply: FastifyReply
    ) => {
        await requireAdmin(request);
        const { id } = request.params;
        const { role, active } = request.body;

        if (id === request.user.id && (active === false || (role && role !== 'ADMIN'))) {
            throw new AppError('You cannot change your own permission or status!', 400);
        }

        const userExists = await prisma.user.findUnique({ where: { id } });
        if (!userExists) {
            throw new AppError('User not found!', 404);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(role !== undefined && { role }),
                ...(active !== undefined && { active })
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true
            }
        });

        return reply.send({ success: true, data: updatedUser });
    });
}