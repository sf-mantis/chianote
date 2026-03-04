import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const passwordHash = await bcrypt.hash('admin123', 10);
        const user = await prisma.user.upsert({
            where: { email: 'admin@chianote.com' },
            update: { password: passwordHash },
            create: {
                email: 'admin@chianote.com',
                name: '기본 사용자',
                password: passwordHash,
            },
        });
        return NextResponse.json({ success: true, user: user.email });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
