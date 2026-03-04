import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { childId, duration = 180, points = 10 } = body;

        if (!childId) {
            return NextResponse.json({ error: "Missing childId" }, { status: 400 });
        }

        // Verify ownership
        const child = await prisma.child.findUnique({
            where: { id: childId }
        });

        if (!child || child.parentId !== session.user.id) {
            return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
        }

        const record = await prisma.brushingRecord.create({
            data: {
                childId,
                duration,
                points
            }
        });

        return NextResponse.json(record, { status: 201 });
    } catch (error) {
        console.error("Failed to save brushing record:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const childId = searchParams.get("childId");

        if (!childId) {
            return NextResponse.json({ error: "Missing childId" }, { status: 400 });
        }

        // Verify ownership
        const child = await prisma.child.findUnique({
            where: { id: childId }
        });

        if (!child || child.parentId !== session.user.id) {
            return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
        }

        const records = await prisma.brushingRecord.findMany({
            where: { childId },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json(records);
    } catch (error) {
        console.error("Failed to fetch brushing records:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
