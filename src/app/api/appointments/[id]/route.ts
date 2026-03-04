import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = await context.params;
        const appointmentId = params.id;

        // Verify ownership: the appointment belongs to a child that belongs to the user
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { child: true }
        });

        if (!appointment || appointment.child.parentId !== session.user.id) {
            return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
        }

        await prisma.appointment.delete({
            where: { id: appointmentId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete appointment:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
