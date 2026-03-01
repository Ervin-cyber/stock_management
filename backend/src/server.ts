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
import userRoutes from './routes/user.routes';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

export const app = Fastify({ logger: process.env.APP_LOGGER_ENABLED === 'true' });

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const FRONTEND_URL = process.env.FRONTEND_URL || (() => { throw new Error('FRONTEND_URL is not set!') })()

app.register(swagger, {
    openapi: {
        info: {
            title: 'StockFlow API',
            description: 'Advanced Warehouse Management System API Documentation',
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    transform: jsonSchemaTransform,
});

app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
    },
});

app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: function (request, context) {
        throw new AppError(`Too many requests! Please try again after ${context.after}.`, 429);
    }
});
console.log("CORS ENABLED FOR THIS URL:", FRONTEND_URL);
app.register(cors, {
    origin: [FRONTEND_URL, 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
});

app.register(authPlugin);
app.register(errorHandler)

app.register(authRoutes, { prefix: '/api/v1/auth' });
app.register(userRoutes, { prefix: '/api/v1/users' });
app.register(productRoutes, { prefix: '/api/v1/products' });
app.register(warehouseRoutes, { prefix: '/api/v1/warehouses' });
app.register(movementRoutes, { prefix: '/api/v1/movements' });
app.register(dashboardRoutes, { prefix: '/api/v1/dashboard' });


app.get('/health', async (request, reply) => {
    reply.send({ status: 'ok', timestamp: new Date().toISOString() })
});

const start = async () => {
    try {
        const port = parseInt(process.env.APP_PORT ?? '3000');

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