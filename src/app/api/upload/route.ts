import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate a unique filename to prevent overwriting
        const originalExt = path.extname(file.name);
        const uniqueSuffix = crypto.randomBytes(8).toString('hex');
        const filename = `${Date.now()}-${uniqueSuffix}${originalExt}`;

        const uploadDir = path.join(process.cwd(), "public/uploads");
        const filepath = path.join(uploadDir, filename);

        // Save to public/uploads
        await writeFile(filepath, buffer);

        // Return the public URL path
        return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
    } catch (error) {
        console.error("Failed to upload file:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}
