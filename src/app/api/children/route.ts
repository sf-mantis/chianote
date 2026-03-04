import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { z } from "zod";

const childSchema = z.object({
    name: z.string().min(1, "Name is required"),
    birthDate: z.string().min(1, "Birth date is required"), // Assuming YYYY-MM-DD
    gender: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsedData = childSchema.parse(body);

        const newChild = await prisma.child.create({
            data: {
                parentId: session.user.id,
                name: parsedData.name,
                dateOfBirth: new Date(parsedData.birthDate),
                gender: parsedData.gender || null,
            },
        });

        return NextResponse.json(newChild, { status: 201 });
    } catch (error) {
        console.error("Failed to create child profile:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: error.format() }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(_req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const children = await prisma.child.findMany({
            where: { parentId: session.user.id },
            include: {
                _count: {
                    select: { records: true, appointments: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(children);
    } catch (error) {
        console.error("Failed to fetch children:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
