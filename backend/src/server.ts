import * as dotenv from 'dotenv';
import fastifyJwt from '@fastify/jwt';
import * as bcrypt from 'bcrypt';

dotenv.config();

import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
export const app = Fastify({ logger: process.env.APP_LOGGER_ENABLED === 'true' });

app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'supersecret_fallback'
});

app.get('/health', async (request, reply) => {
    reply.send({ status: 'ok', timestamp: new Date().toISOString() })
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

app.post('/api/auth/login', async (request, reply) => {
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

const start = async () => {
    try {
        const port = parseInt(process.env.APP_PORT ?? '3001');

        await app.listen({ port, host: '0.0.0.0' }); //'0.0.0.0' docker
        console.log(`🚀 Server running at http://localhost:${port} address`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

// --- Graceful Shutdown ---
['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, async () => {
        console.log(`\n🛑 Server shutdown (${signal})...`);
        await app.close();
        await prisma.$disconnect();
        console.log('✅ Prisma connection successfully closed!');
        process.exit(0);
    });
});

start();