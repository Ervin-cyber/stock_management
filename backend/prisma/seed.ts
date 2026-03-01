import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.product.count();

    if (count > 0) {
        console.log("Database already contains data, seeding is skipped.");
        return;
    }
    
    console.log('🌱 Seeding database...');

    const plainPassword = 'adminpassword123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@mail.com' },
        update: {},
        create: {
            email: 'admin@mail.com',
            name: 'Admin',
            password: hashedPassword,
            role: 'ADMIN',
            active: true
        },
    });

    console.log(`✅ Admin user created: ${admin.email}`);

    const manager = await prisma.user.upsert({
        where: { email: 'istvan@mail.com' },
        update: {},
        create: {
            email: 'istvan@mail.com',
            name: 'Istvan Manager',
            password: hashedPassword,
            role: 'MANAGER',
            active: true
        },
    });

    console.log(`✅ Manager user created: ${manager.email}`);

    const viewer = await prisma.user.upsert({
        where: { email: 'attila@mail.com' },
        update: {},
        create: {
            email: 'attila@mail.com',
            name: 'Attila Viewer',
            password: hashedPassword,
            role: 'VIEWER',
            active: true
        },
    });

    console.log(`✅ Viewer user created: ${viewer.email}`);

    const mainWarehouse = await prisma.warehouse.upsert({
        where: { name: 'Main Warehouse' },
        update: {},
        create: {
            name: 'Main Warehouse',
            location: 'Cluj-Napoca',
            createdById: admin.id,
        }
    });

    console.log(`✅ Main Warehouse created: ${mainWarehouse.name}`);

    const secondaryWarehouse = await prisma.warehouse.upsert({
        where: { name: 'Secondary Warehouse' },
        update: {},
        create: {
            name: 'Secondary Warehouse',
            location: 'Targu-Mures',
            createdById: admin.id,
        }
    });

    console.log(`✅ Secondary Warehouse created: ${secondaryWarehouse.name}`);

    console.log('Seeding Apple Dev Office products...');

    const appleOfficeProducts = [
        { sku: 'MAC-MBP16-M3M', name: 'MacBook Pro 16" M3 Max', description: 'Powerhouse for senior developers, 64GB RAM, 2TB SSD.' },
        { sku: 'MAC-MBP14-M3P', name: 'MacBook Pro 14" M3 Pro', description: 'Standard developer machine, 32GB RAM, 1TB SSD.' },
        { sku: 'MAC-AIR15-M3', name: 'MacBook Air 15" M3', description: 'Lightweight machine for project managers and designers.' },
        { sku: 'MAC-STUDIO-M2U', name: 'Mac Studio M2 Ultra', description: 'Desktop workstation for CI/CD builds and video editing.' },
        { sku: 'DIS-APL-STUDIO', name: 'Apple Studio Display', description: '27-inch 5K Retina display for development and design.' },
        { sku: 'DIS-APL-XDR', name: 'Apple Pro Display XDR', description: '32-inch 6K professional monitor for color grading.' },
        { sku: 'PER-MAG-KEY', name: 'Magic Keyboard with Touch ID', description: 'Wireless keyboard with Touch ID biometric authentication.' },
        { sku: 'PER-MAG-MOUSE', name: 'Magic Mouse', description: 'Wireless Apple mouse with multi-touch surface.' },
        { sku: 'PER-MAG-TRACK', name: 'Magic Trackpad', description: 'External trackpad for gesture control in desktop environments.' },
        { sku: 'DEV-IPAD-PRO', name: 'iPad Pro 12.9"', description: 'Test device for native testing of iOS and iPadOS applications.' },
        { sku: 'DEV-IPHONE-15P', name: 'iPhone 15 Pro', description: 'Physical test device for mobile development and camera testing.' },
        { sku: 'AUD-AIR-PRO2', name: 'AirPods Pro 2', description: 'Noise-canceling earbuds for focused deep work.' },
        { sku: 'AUD-AIR-MAX', name: 'AirPods Max', description: 'Premium over-ear headphones for open office environments.' },
        { sku: 'ACC-CALD-TS4', name: 'CalDigit TS4 Thunderbolt 4 Dock', description: 'Industry-standard docking station for multiple monitors and peripherals.' },
        { sku: 'PER-LOGI-MX3S', name: 'Logitech MX Master 3S for Mac', description: 'Ergonomic mouse with dedicated Mac support for coding.' },
        { sku: 'PER-KEYC-Q1', name: 'Keychron Q1 Pro', description: 'Mechanical keyboard for programmers (Mac layout).' },
        { sku: 'DIS-LG-38UW', name: 'LG 38" UltraWide Monitor', description: 'Ultrawide monitor for split-screen coding and multitasking.' },
        { sku: 'FURN-HERM-AER', name: 'Herman Miller Aeron Chair', description: 'Premium ergonomic office chair for long coding sessions.' },
        { sku: 'ACC-BELK-MAG', name: 'Belkin 3-in-1 MagSafe', description: 'Wireless desktop charging station for iPhone, Watch, and AirPods.' },
        { sku: 'ACC-APL-PENCIL', name: 'Apple Pencil (2nd Gen)', description: 'Accessory for the iPad test device and UI/UX sketching.' }
    ];

    for (const product of appleOfficeProducts) {
        await prisma.product.upsert({
            where: { sku: product.sku },
            update: {},
            create: {
                sku: product.sku,
                name: product.name,
                description: product.description,
                createdById: admin.id,
            }
        });
    }

    console.log('✅ 20 Apple Dev Office products seeded successfully!');

    const warehouses = [mainWarehouse, secondaryWarehouse];

    const allProducts = await prisma.product.findMany();

    for (const product of allProducts) {
        for (const warehouse of warehouses) {

            const isLowStock = Math.random() < 0.2;
            const randomQuantity = isLowStock
                ? Math.floor(Math.random() * 8) + 1
                : Math.floor(Math.random() * 40) + 10;

            await prisma.$transaction(async (tx) => {

                await tx.stockMovement.create({
                    data: {
                        movementType: 'IN',
                        stockQuantity: randomQuantity,
                        productId: product.id,
                        destinationWarehouseId: warehouse.id,
                        createdById: admin.id,
                        description: 'seed'
                    }
                });

                await tx.stock.upsert({
                    where: {
                        warehouseId_productId: {
                            warehouseId: warehouse.id,
                            productId: product.id
                        }
                    },
                    update: {
                        stockQuantity: randomQuantity
                    },
                    create: {
                        warehouseId: warehouse.id,
                        productId: product.id,
                        stockQuantity: randomQuantity
                    }
                });
            });
        }
    }

    console.log('✅ Products stock seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });