import { FastifyInstance, FastifyRequest } from "fastify";
import bcrypt from 'bcrypt';
import prisma from "../lib/prisma";
import { LoginBody } from "../types";

export default async function authRoutes(app: FastifyInstance) {
    app.post('/login', async (
        request: FastifyRequest<{ Body: LoginBody }>
        , reply) => {
        const { email, password } = request.body ?? {};

        if (!email || !password) {
            return reply.status(400).send({ error: "Email and password are required!" });
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!user || !user.active || user.deletedAt) {
            return reply.status(401).send({ error: "Wrong email or password!" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return reply.status(401).send({ error: "Wrong email or password!" });
        }

        const token = app.jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role,
        }, { expiresIn: '1d' }); // jwt expiration 1 day

        reply.send({
            success: true,
            token: token,
            user: {
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    });

    app.get('/me', {
        onRequest: [app.authenticate]
    }, async (request, reply) => {
        const user = await prisma.user.findUnique({
            where: { id: request.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });

        if (!user) {
            return reply.status(404).send({ success: false, error: 'User not found!' });
        }

        return reply.send({ success: true, user });
    });
}