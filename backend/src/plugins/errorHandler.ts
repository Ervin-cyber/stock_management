import fp from 'fastify-plugin';
import { FastifyInstance, FastifyError } from 'fastify';

export default fp(async (app: FastifyInstance) => {
    app.setErrorHandler((error: FastifyError, request, reply) => {
        app.log.error(error);

        if (error.message.includes("Can't reach database server") || error.message.includes("P1001")) {
            return reply.status(503).send({ 
                success: false,
                error: 'Service Unavailable', 
                message: 'Database is currently unavailable' 
            });
        }

        reply.status(500).send({ 
            success: false,
            error: 'Internal Server Error', 
            message: 'An unexpected error occurred on the server side' 
        });
    });
});