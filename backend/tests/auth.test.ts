import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../src/server';
import prisma from '../src/lib/prisma';

describe('Authentication and Basic api test', () => {
    
    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('GET /health - It needs to be successful', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/health',
        });

        expect(response.statusCode).toBe(200);
        const json = response.json();
        expect(json.status).toBe('ok');
        expect(json.timestamp).toBeDefined();
    });

    it('POST /api/v1/auth/login - Empty request needs to be rejected', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: {}
        });

        expect(response.statusCode).toBe(400); // Bad Request
    });

    it('POST /api/v1/auth/login - Login successful with admin', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: {
                email: 'admin@mail.com',
                password: 'adminpassword123'
            }
        });

        expect(response.statusCode).toBe(200);
        const json = response.json();
        expect(json.success).toBe(true);
        expect(json.token).toBeTypeOf('string');
        expect(json.user.email).toBe('admin@mail.com');
    });

});