import fp from 'fastify-plugin';
import fastifyJwt from "@fastify/jwt";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import prisma from '../lib/prisma';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default fp(async (app: FastifyInstance) => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    typedApp.register(fastifyJwt, {
        secret: process.env.JWT_SECRET ?? (() => { throw new Error('JWT_SECRET is not set!') })()
    });

    typedApp.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            try {
                await request.jwtVerify();
            } catch (err: any) {
                const isExpired = err?.code === 'FAST_JWT_EXPIRED' || err?.message?.includes('expired');
                return reply.status(401).send({
                    error: {
                        code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
                        message: isExpired ? 'Token has expired, please log in again.' : 'Invalid or missing token.',
                        details: null
                    }
                });
            }

            const user = await prisma.user.findUnique({ where: { id: request.user.id } });
            if (!user || !user.active) {
                return reply.status(401).send({
                    error: {
                        code: 'ACCOUNT_INACTIVE',
                        message: 'Your account has been deactivated.',
                        details: null
                    }
                });
            }
        } catch (err: any) {
            const code = err?.statusCode === 401 ? 'UNAUTHORIZED' : (err?.code || 'UNAUTHORIZED');
            reply.status(401).send({
                error: {
                    code: code,
                    message: 'Unauthenticated!',
                    details: null
                }
            });
        }
    });
});