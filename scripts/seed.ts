import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('admin123', 10);

    const user = await prisma.user.upsert({
        where: { email: 'admin@chianote.com' },
        update: {},
        create: {
            email: 'admin@chianote.com',
            name: '기본 사용자',
            password: passwordHash,
        },
    });

    console.log('Seed successful! Default user created:', user.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
