import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

console.log("Testing Prisma Client instantiation...");

try {
    // Let's see what TypeScript infers and what fails.
    const adapter = new PrismaLibSql({ url: 'file:dev.db' });
    const prisma = new PrismaClient({ adapter });

    prisma.user.findMany().then(() => {
        console.log("Success with manually forced datasourceUrl!");
        process.exit(0);
    }).catch((e: any) => {
        console.error("Query failed:", e.message);
        process.exit(1);
    });
} catch (e: any) {
    console.error("Constructor failed:", e.message);
    process.exit(1);
}
