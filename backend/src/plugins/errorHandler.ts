import fp from 'fastify-plugin';
import { FastifyInstance, FastifyError } from 'fastify';
import { AppError } from '../utils/AppError';

export default fp(async (app: FastifyInstance) => {
    app.setErrorHandler((error: FastifyError | any, request, reply) => {
        const isProd = process.env.NODE_ENV === 'production';

        app.log.error(error);

        if (error instanceof AppError || error.name === 'AppError') {
            return reply.status(error.statusCode).send({
                error: {
                    code: error.code || 'BAD_REQUEST',
                    message: error.message,
                    details: error.details || null
                }
            });
        }

        if (error.validation) {
            return reply.status(400).send({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Hibás bemeneti adatok',
                    details: error.validation
                }
            });
        }

        if (error.message.includes("Can't reach database server") || error.message.includes("P1001")) {
            return reply.status(503).send({
                error: {
                    code: 'DATABASE_UNAVAILABLE',
                    message: 'Database is currently unavailable',
                    details: null
                }
            });
        }

        return reply.status(500).send({
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: isProd ? 'An unexpected error occurred on the server side' : error.message,
                details: isProd ? null : error.stack
            }
        });
    });
});