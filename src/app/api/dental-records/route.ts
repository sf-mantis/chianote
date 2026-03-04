import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { z } from "zod";

// Schema for creating a dental record
const recordSchema = z.object({
    childId: z.string().min(1, "Child ID is required"),
    toothId: z.string().min(1, "Tooth ID is required"),
    status: z.enum(["HEALTHY", "DECAYED", "TREATED", "SEALANT", "EXTRACTED", "UNKNOWN"]),
    notes: z.string().optional(),
    imageUrl: z.string().optional(),
    recordDate: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        // In a real scenario you would check if the child belongs to the session user
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsedData = recordSchema.parse(body);

        const newRecord = await prisma.toothRecord.create({
            data: {
                childId: parsedData.childId,
                toothId: parsedData.toothId,
                status: parsedData.status,
                notes: parsedData.notes || null,
                imageUrl: parsedData.imageUrl || null,
                recordDate: parsedData.recordDate ? new Date(parsedData.recordDate) : undefined,
            },
        });

        return NextResponse.json(newRecord, { status: 201 });
    } catch (error) {
        console.error("Failed to create dental record:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: error.format() }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = req.nextUrl.searchParams;
        const childId = searchParams.get("childId");

        if (!childId) {
            return NextResponse.json({ error: "Child ID is required" }, { status: 400 });
        }

        const records = await prisma.toothRecord.findMany({
            where: { childId },
            orderBy: { recordDate: 'desc' },
        });

        return NextResponse.json(records);
    } catch (error) {
        console.error("Failed to fetch dental records:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
