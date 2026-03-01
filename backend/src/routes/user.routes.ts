import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { AdminUpdateUserBodySchema, IdentifierParamSchema } from "../types";
import z from "zod";
import * as bcrypt from 'bcrypt';

export default async function userRoutes(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    typedApp.addHook('onRequest', app.authenticate);

    const requireAdmin = async (request: FastifyRequest) => {
        if (request.user.role !== 'ADMIN') {
            throw new AppError('Forbidden: Admin access required.', 403);
        }
    };

    typedApp.get('/', {
        schema: {
            description: '',
            tags: ['Users'],
            security: [{ bearerAuth: [] }]
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
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

    typedApp.patch('/:id', {
        schema: {
            description: 'Update',
            tags: ['Users'],
            security: [{ bearerAuth: [] }],
            params: IdentifierParamSchema,
            body: AdminUpdateUserBodySchema
        },
    }, async (request, reply) => {
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

    typedApp.put('/profile', {
        preValidation: [app.authenticate],
        schema: {
            body: z.object({
                name: z.string().min(2),
                currentPassword: z.string().optional(),
                newPassword: z.string().min(6).optional()
            }).refine(data => {
                if (data.newPassword && !data.currentPassword) return false;
                return true;
            }, { message: "Current password is required to set a new password", path: ["currentPassword"] })
        }
    }, async (request, reply) => {
        const userId = (request.user as any).id;
        const { name, currentPassword, newPassword } = request.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");

        const updateData: any = { name };

        if (newPassword && currentPassword) {
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return reply.status(400).send({ success: false, message: "Invalid current password." } as any);
            }
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        const token = app.jwt.sign({
            id: updatedUser.id,
            role: updatedUser.role
        } as any, { expiresIn: '1d' });
        return reply.send({
            success: true,
            token,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
            }
        });
    });
}