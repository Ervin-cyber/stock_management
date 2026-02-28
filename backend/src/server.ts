import * as dotenv from 'dotenv';
dotenv.config();
import authPlugin from './plugins/auth';
import errorHandler from './plugins/errorHandler'
import Fastify from 'fastify';
import prisma from './lib/prisma';
import authRoutes from './routes/auth.routes';
import warehouseRoutes from './routes/warehouses.routes';
import productRoutes from './routes/products.routes';

import cors from '@fastify/cors';
import dashboardRoutes from './routes/dashboard.routes';
import movementRoutes from './routes/movements.routes';
import fastifyRateLimit from '@fastify/rate-limit';
import { AppError } from './utils/AppError';

export const app = Fastify({ logger: process.env.APP_LOGGER_ENABLED === 'true' });

const FRONTEND_URL = process.env.FRONTEND_URL || (() => { throw new Error('FRONTEND_URL is not set!') })()

app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: function (request, context) {
        throw new AppError(`Too many requests! Please try again after ${context.after}.`, 429);
    }
});

app.register(cors, {
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
});

app.register(authPlugin);
app.register(errorHandler)

app.register(authRoutes, { prefix: '/api/auth' });
app.register(productRoutes, { prefix: '/api/products' });
app.register(warehouseRoutes, { prefix: '/api/warehouses' });
app.register(movementRoutes, { prefix: '/api/movements' });
app.register(dashboardRoutes, { prefix: '/api/dashboard' });

app.get('/health', async (request, reply) => {
    reply.send({ status: 'ok', timestamp: new Date().toISOString() })
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

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
    start();
}