import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcrypt';
import { app } from '../src/server';
import prisma from '../src/lib/prisma';

describe('Stock & Movements API', () => {
    let managerToken = '';
    let userToken = '';

    let managerId = '';
    let viewerUserId = '';
    let sourceWarehouseId = '';
    let destWarehouseId = '';
    let testProductId = '';

    const uniqueSuffix = Date.now();

    beforeAll(async () => {
        const hashedManagerPassword = await bcrypt.hash('testpassword123', 10);
        const managerUser = await prisma.user.create({
            data: {
                email: `manager_${uniqueSuffix}@mail.com`,
                name: 'Stock Manager',
                password: hashedManagerPassword,
                role: 'MANAGER',
                active: true
            }
        });
        managerId = managerUser.id;

        const managerLogin = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { email: managerUser.email, password: 'testpassword123' }
        });
        managerToken = managerLogin.json().token;

        const hashedViewerPassword = await bcrypt.hash('userpassword123', 10);
        const viewerUser = await prisma.user.create({
            data: {
                email: `stockuser_${uniqueSuffix}@mail.com`,
                name: 'Stock Tester User',
                password: hashedViewerPassword,
                role: 'VIEWER',
                active: true
            }
        });
        viewerUserId = viewerUser.id;

        const userLogin = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { email: viewerUser.email, password: 'userpassword123' }
        });
        userToken = userLogin.json().token;

        const w1 = await prisma.warehouse.create({ data: { name: `Source W ${uniqueSuffix}`, location: 'A', createdById: managerId } });
        const w2 = await prisma.warehouse.create({ data: { name: `Dest W ${uniqueSuffix}`, location: 'B', createdById: managerId } });
        sourceWarehouseId = w1.id;
        destWarehouseId = w2.id;

        const p1 = await prisma.product.create({ data: { sku: `STK-PROD-${uniqueSuffix}`, name: 'Stock Test Product', createdById: managerId } });
        testProductId = p1.id;
    });

    afterAll(async () => {
        await prisma.stockMovement.deleteMany({ where: { productId: testProductId } });
        await prisma.stock.deleteMany({ where: { productId: testProductId } });
        await prisma.product.deleteMany({ where: { id: testProductId } });
        await prisma.warehouse.deleteMany({ where: { id: { in: [sourceWarehouseId, destWarehouseId] } } });
        await prisma.user.deleteMany({ where: { id: { in: [managerId, viewerUserId] } } });

        await prisma.$disconnect();
    });

    it('GET /api/movements - Should allow Viewer User to view stock (200)', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/movements',
            headers: { authorization: `Bearer ${userToken}` }
        });
        expect(response.statusCode).toBe(200);
    });

    it('POST /api/movements - Should reject Viewer User (403)', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/movements',
            headers: { authorization: `Bearer ${userToken}` },
            payload: { productId: testProductId, movementType: 'IN', stockQuantity: 10, destinationWarehouseId: destWarehouseId }
        });
        expect(response.statusCode).toBe(403);
    });

    it('POST /api/movements - IN: Should successfully receive goods (201)', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/movements',
            headers: { authorization: `Bearer ${managerToken}` },
            payload: {
                productId: testProductId,
                movementType: 'IN',
                stockQuantity: 100,
                destinationWarehouseId: destWarehouseId
            }
        });

        expect(response.statusCode).toBe(201);

        const stock = await prisma.stock.findUnique({
            where: { warehouseId_productId: { warehouseId: destWarehouseId, productId: testProductId } }
        });
        expect(stock?.stockQuantity).toBe(100);
    });

    it('POST /api/movements - OUT: Should fail if source has insufficient stock (400)', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/movements',
            headers: { authorization: `Bearer ${managerToken}` },
            payload: {
                productId: testProductId,
                movementType: 'OUT',
                stockQuantity: 150,
                sourceWarehouseId: destWarehouseId
            }
        });

        expect(response.statusCode).toBe(400);
        expect(response.json().error?.message).toContain('Insufficient stock');
    });

    it('POST /api/movements - TRANSFER: Should successfully transfer goods (201)', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/movements',
            headers: { authorization: `Bearer ${managerToken}` },
            payload: {
                productId: testProductId,
                movementType: 'TRANSFER',
                stockQuantity: 40,
                sourceWarehouseId: destWarehouseId,
                destinationWarehouseId: sourceWarehouseId
            }
        });

        expect(response.statusCode).toBe(201);

        const sourceStock = await prisma.stock.findUnique({
            where: { warehouseId_productId: { warehouseId: destWarehouseId, productId: testProductId } }
        });
        expect(sourceStock?.stockQuantity).toBe(60);

        const destStock = await prisma.stock.findUnique({
            where: { warehouseId_productId: { warehouseId: sourceWarehouseId, productId: testProductId } }
        });
        expect(destStock?.stockQuantity).toBe(40);
    });
});