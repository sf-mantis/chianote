import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Lazy evaluate PrismaClient initialization to avoid Vercel build-time connection errors
const getPrismaClient = () => {
    if (!globalThis.prismaGlobal) {
        if (!process.env.DATABASE_URL) {
            process.env.DATABASE_URL = "postgresql://postgres:dummy@localhost:5432/postgres";
        }

        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool);

        globalThis.prismaGlobal = new PrismaClient({ adapter });
    }
    return globalThis.prismaGlobal
}

declare const globalThis: {
    prismaGlobal: PrismaClient;
} & typeof global;

// Use a Proxy so the class isn't initialized until a query is actually made
const prisma = new Proxy({} as PrismaClient, {
    get(target, prop) {
        const client = getPrismaClient();
        return Reflect.get(client, prop);
    }
})

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
