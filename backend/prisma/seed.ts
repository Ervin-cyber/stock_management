import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
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
        },
    });

    console.log(`✅ Admin user created: ${admin.email}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });