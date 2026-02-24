import * as dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = Fastify({ logger: process.env.APP_LOGGER_ENABLED === 'true' });

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