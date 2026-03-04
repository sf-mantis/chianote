import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { z } from "zod";

const appointmentSchema = z.object({
    childId: z.string().min(1, "Child ID is required"),
    clinicName: z.string().min(1, "Clinic name is required"),
    appointmentDate: z.string().min(1, "Date is required"),
    notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsedData = appointmentSchema.parse(body);

        const newAppointment = await prisma.appointment.create({
            data: {
                childId: parsedData.childId,
                clinicName: parsedData.clinicName,
                date: new Date(parsedData.appointmentDate),
                description: parsedData.notes || null,
            },
        });

        return NextResponse.json(newAppointment, { status: 201 });
    } catch (error) {
        console.error("Failed to create appointment:", error);
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

        // Get all appointments for children belonging to this parent
        const appointments = await prisma.appointment.findMany({
            where: {
                child: {
                    parentId: session.user.id
                },
                date: {
                    gte: new Date() // Only upcoming ones
                }
            },
            include: {
                child: {
                    select: { name: true }
                }
            },
            orderBy: { date: 'asc' },
        });

        return NextResponse.json(appointments);
    } catch (error) {
        console.error("Failed to fetch appointments:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
