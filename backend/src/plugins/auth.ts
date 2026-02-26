import fp from 'fastify-plugin';
import fastifyJwt from "@fastify/jwt";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export default fp(async (app: FastifyInstance) => {
    app.register(fastifyJwt, {
        secret: process.env.JWT_SECRET ?? (() => { throw new Error('JWT_SECRET is not set!') })()
    });

    app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.status(401).send({ error: 'Unauthenticated!' });
        }
    });
});