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

        // Await the params object before accessing properties (Next.js 15+ requirement)
        const params = await context.params;
        const childId = params.id;

        // Verify ownership and fetch records to clean up images before deleting
        const child = await prisma.child.findUnique({
            where: { id: childId },
            include: { records: true }
        });

        if (!child || child.parentId !== session.user.id) {
            return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
        }

        // Clean up physical images
        if (child.records) {
            for (const record of child.records) {
                if (record.imageUrl && record.imageUrl.startsWith('/uploads/')) {
                    try {
                        const filename = record.imageUrl.replace('/uploads/', '');
                        const filepath = path.join(process.cwd(), 'public/uploads', filename);
                        await unlink(filepath);
                    } catch (err) {
                        console.error(`Failed to delete orphaned file: ${record.imageUrl}`, err);
                    }
                }
            }
        }

        await prisma.child.delete({
            where: { id: childId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete child profile:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
