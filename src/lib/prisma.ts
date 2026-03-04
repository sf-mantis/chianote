import { PrismaClient } from '@prisma/client'

// Lazy evaluate PrismaClient initialization to avoid Vercel build-time connection errors
const getPrismaClient = () => {
    if (!globalThis.prismaGlobal) {
        // Prisma 7에서는 생성자에 직접 URL을 넘기기보다 
        // 환경 변수 DATABASE_URL을 시스템 레벨에서 참조하는 것을 선호합니다.
        globalThis.prismaGlobal = new PrismaClient();
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
