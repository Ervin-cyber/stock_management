import fp from 'fastify-plugin';
import fastifyJwt from "@fastify/jwt";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';

export default fp(async (app: FastifyInstance) => {
    app.register(fastifyJwt, {
        secret: process.env.JWT_SECRET ?? (() => { throw new Error('JWT_SECRET is not set!') })()
    });

    app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();

            const user = await prisma.user.findUnique({
                where: { id: request.user.id }
            });

            if (!user || !user.active) {
                throw new AppError('Wrong email or password!', 401);
            }
        } catch (err) {
            reply.status(401).send({ error: 'Unauthenticated!' });
        }
    });
});