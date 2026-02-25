import * as dotenv from 'dotenv';
import authPlugin from './plugins/auth';
import errorHandler from './plugins/errorHandler'

dotenv.config();
import Fastify from 'fastify';
import prisma from './lib/prisma';
import authRoutes from './routes/auth.routes';

export const app = Fastify({ logger: process.env.APP_LOGGER_ENABLED === 'true' });

app.register(authPlugin);
app.register(errorHandler)

app.register(authRoutes, { prefix: '/api/auth' });

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

start();