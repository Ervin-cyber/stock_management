import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcrypt';
import { app } from '../src/server';
import prisma from '../src/lib/prisma';

describe('Product CRUD API', () => {
    let adminToken = '';
    let userToken = '';
    let testProductId = '';
    let viewerUserId = '';
    
    const uniqueSku = `TEST-SKU-${Date.now()}`; 
    const viewerUserEmail = `product_user_${Date.now()}@mail.com`;

    beforeAll(async () => {
        const adminLogin = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: { email: 'admin@mail.com', password: 'adminpassword123' }
        });
        adminToken = adminLogin.json().token;

        const hashedPassword = await bcrypt.hash('userpassword123', 10);
        const viewerUser = await prisma.user.create({
            data: {
                email: viewerUserEmail,
                name: 'Product Tester User',
                password: hashedPassword,
                role: 'VIEWER',
                active: true
            }
        });
        viewerUserId = viewerUser.id;

        const userLogin = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: { email: viewerUserEmail, password: 'userpassword123' }
        });
        userToken = userLogin.json().token;
    });

    afterAll(async () => {
        if (testProductId) {
            await prisma.product.deleteMany({ where: { id: testProductId } });
        }
        if (viewerUserId) {
            await prisma.user.delete({ where: { id: viewerUserId } });
        }
        await prisma.$disconnect();
    });

    it('GET /api/v1/products - Should reject without token (401)', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/v1/products'
        });
        expect(response.statusCode).toBe(401);
    });

    it('GET /api/v1/products - Should allow Standard User to view (200)', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/v1/products',
            headers: { authorization: `Bearer ${userToken}` }
        });
        expect(response.statusCode).toBe(200);
    });

    it('POST /api/v1/products - Should reject creation for Standard User (403)', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/products',
            headers: { authorization: `Bearer ${userToken}` },
            payload: { sku: 'KEYBOARD-01', name: 'Logitech' }
        });
        expect(response.statusCode).toBe(403);
    });

    it('POST /api/v1/products - Should create product with Admin token (201)', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/products',
            headers: { authorization: `Bearer ${adminToken}` },
            payload: { sku: uniqueSku, name: 'Logitech mouse' }
        });
        
        expect(response.statusCode).toBe(201);
        const json = response.json();
        expect(json.success).toBe(true);
        expect(json.data.sku).toBe(uniqueSku);
        
        testProductId = json.data.id;
    });

    it('POST /api/v1/products - Should reject duplicate SKU (409)', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/products',
            headers: { authorization: `Bearer ${adminToken}` },
            payload: { sku: uniqueSku, name: 'Lenovo gamepad' }
        });
        expect(response.statusCode).toBe(409);
    });

    it('PUT /api/v1/products/:id - Should successfully update name (200)', async () => {
        const response = await app.inject({
            method: 'PUT',
            url: `/api/v1/products/${testProductId}`,
            headers: { authorization: `Bearer ${adminToken}` },
            payload: { sku: uniqueSku, name: 'Asus Rog Gaming Laptop',  }
        });
        
        expect(response.statusCode).toBe(200);
        expect(response.json().data.name).toBe('Asus Rog Gaming Laptop');
    });

    it('DELETE /api/v1/products/:id - Should successfully perform SOFT DELETE (200)', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/v1/products/${testProductId}`,
            headers: { authorization: `Bearer ${adminToken}` }
        });
        
        expect(response.statusCode).toBe(200);

        const productInDb = await prisma.product.findUnique({ where: { id: testProductId } });
        expect(productInDb).not.toBeNull();
        expect(productInDb?.deletedAt).not.toBeNull();
        expect(productInDb?.active).toBe(false);

        const getResponse = await app.inject({
            method: 'GET',
            url: '/api/v1/products',
            headers: { authorization: `Bearer ${adminToken}` }
        });
        const productsList = getResponse.json().data;
        const found = productsList.find((p: any) => p.id === testProductId);
        expect(found).toBeUndefined();
    });
});