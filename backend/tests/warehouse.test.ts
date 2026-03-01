import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcrypt';
import { app } from '../src/server';
import prisma from '../src/lib/prisma';

describe('Warehouse CRUD API', () => {
    let adminToken = '';
    let viewerToken = '';
    let testWarehouseId = '';
    let viewerUserId = '';
    
    const uniqueWarehouseName = `Test Warehouse ${Date.now()}`; 
    const viewerUserEmail = `viewer_user_${Date.now()}@mail.com`;

    beforeAll(async () => {
        const adminLogin = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: {
                email: 'admin@mail.com',
                password: 'adminpassword123'
            }
        });
        adminToken = adminLogin.json().token;

        const hashedPassword = await bcrypt.hash('viewerpassword123', 10);
        const viewerUser = await prisma.user.create({
            data: {
                email: viewerUserEmail,
                name: 'Test viewer',
                password: hashedPassword,
                role: 'VIEWER',
                active: true
            }
        });
        viewerUserId = viewerUser.id;

        const userLogin = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: {
                email: viewerUserEmail,
                password: 'viewerpassword123'
            }
        });
        viewerToken = userLogin.json().token;
    });

    afterAll(async () => {
        if (testWarehouseId) {
            try {
                await prisma.warehouse.delete({ where: { id: testWarehouseId } });
            } catch (error) {
                
            }
        }

        if (viewerUserId) {
            await prisma.user.delete({ where: { id: viewerUserId } });
        }

        await prisma.$disconnect();
    });

    it('GET /api/v1/warehouses - Should reject request without token (401)', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/v1/warehouses'
        });
        expect(response.statusCode).toBe(401);
    });

    it('GET /api/v1/warehouses - Should allow Viewer User to view warehouses (200)', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/v1/warehouses',
            headers: { authorization: `Bearer ${viewerToken}` }
        });
        expect(response.statusCode).toBe(200);
        expect(response.json().success).toBe(true);
    });

    it('POST /api/v1/warehouses - Should reject creation for Viewer User (403)', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/warehouses',
            headers: { authorization: `Bearer ${viewerToken}` },
            payload: { name: 'Warehouse 1', location: 'Targu-Mures' }
        });
        expect(response.statusCode).toBe(403);
    });

    it('POST /api/v1/warehouses - Should create a warehouse with Admin token (201)', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/warehouses',
            headers: { authorization: `Bearer ${adminToken}` },
            payload: {
                name: uniqueWarehouseName,
                location: 'Bucharest'
            }
        });
        
        expect(response.statusCode).toBe(201);
        const json = response.json();
        expect(json.success).toBe(true);
        expect(json.data.name).toBe(uniqueWarehouseName);
        
        testWarehouseId = json.data.id;
    });

    it('POST /api/v1/warehouses - Should reject duplicate warehouse name (409)', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/warehouses',
            headers: { authorization: `Bearer ${adminToken}` },
            payload: {
                name: uniqueWarehouseName,
                location: 'Cluj Napoca'
            }
        });
        
        expect(response.statusCode).toBe(409);
    });

    it('PUT /api/v1/warehouses/:id - Should reject update for Viewer User (403)', async () => {
        const response = await app.inject({
            method: 'PUT',
            url: `/api/v1/warehouses/${testWarehouseId}`,
            headers: { authorization: `Bearer ${viewerToken}` },
            payload: { location: 'Bucharest' }
        });
        expect(response.statusCode).toBe(403);
    });

    it('PUT /api/v1/warehouses/:id - Should successfully update with Admin token (200)', async () => {
        const response = await app.inject({
            method: 'PUT',
            url: `/api/v1/warehouses/${testWarehouseId}`,
            headers: { authorization: `Bearer ${adminToken}` },
            payload: { name: uniqueWarehouseName, location: 'Targu-Mures' }
        });
        
        expect(response.statusCode).toBe(200);
        expect(response.json().data.location).toBe('Targu-Mures');
    });

    it('DELETE /api/v1/warehouses/:id - Should reject deletion for Viewer User (403)', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/v1/warehouses/${testWarehouseId}`,
            headers: { authorization: `Bearer ${viewerToken}` }
        });
        expect(response.statusCode).toBe(403);
    });

    it('DELETE /api/v1/warehouses/:id - Should successfully delete with Admin token (200)', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/v1/warehouses/${testWarehouseId}`,
            headers: { authorization: `Bearer ${adminToken}` }
        });
        
        expect(response.statusCode).toBe(200);

        const deletedWarehouse = await prisma.warehouse.findUnique({
            where: { id: testWarehouseId }
        });
        expect(deletedWarehouse).toBeNull();
    });
});