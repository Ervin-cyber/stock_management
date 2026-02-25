import { FastifyInstance } from "fastify";
import bcrypt from 'bcrypt';
import prisma from "../lib/prisma";

export default async function authRoutes(app: FastifyInstance) {
    app.post('/login', async (request, reply) => {
        const { email, password } = request.body as any ?? {};

        if (!email || !password) {
            return reply.status(400).send({ error: "Email and password are required!" });
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!user) {
            return reply.status(400).send({ error: "Wrong email or password!" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return reply.status(400).send({ error: "Wrong email or password!" });
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
        onRequest: [app.authenticate as any]
    }, async (request, reply) => {
        try {
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
                return reply.status(404).send({ success: false, error: 'Felhasználó nem található!' });
            }

            return reply.send({ success: true, user });
        } catch (error) {
            throw error;
        }
    });

    app.get('/test-db', async (request, reply) => {
        try {
            const warehouses = await prisma.warehouse.findMany();
            reply.send({ success: true, count: warehouses.length, data: warehouses });
        } catch (error) {
            app.log.error(error);
            reply.status(500).send({ success: false, error: 'Database error' });
        }
    });
}