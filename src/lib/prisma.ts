import { PrismaClient } from '@prisma/client'

// Lazy evaluate PrismaClient initialization to avoid Vercel build-time connection errors
const getPrismaClient = () => {
    if (!globalThis.prismaGlobal) {
        // If DATABASE_URL is missing during build time, provide a dummy to pass instantiation syntax
        const dummyUrl = "postgresql://postgres:dummy@localhost:5432/postgres";
        if (!process.env.DATABASE_URL) {
            process.env.DATABASE_URL = "postgresql://postgres:dummy@localhost:5432/postgres";
        }
        globalThis.prismaGlobal = new PrismaClient()
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
