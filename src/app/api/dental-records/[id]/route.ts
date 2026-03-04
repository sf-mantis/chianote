import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = await context.params;
        const recordId = params.id;

        // Verify ownership (the record belongs to a child that belongs to the user)
        const record = await prisma.toothRecord.findUnique({
            where: { id: recordId },
            include: { child: true }
        });

        if (!record || record.child.parentId !== session.user.id) {
            return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
        }

        // Clean up physical images
        if (record.imageUrl && record.imageUrl.startsWith('/uploads/')) {
            try {
                const filename = record.imageUrl.replace('/uploads/', '');
                const filepath = path.join(process.cwd(), 'public/uploads', filename);
                await unlink(filepath);
            } catch (err) {
                console.error(`Failed to delete orphaned file: ${record.imageUrl}`, err);
            }
        }

        await prisma.toothRecord.delete({
            where: { id: recordId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete dental record:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
