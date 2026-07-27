import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import {
  isCloudinaryConfigured,
  uploadImageBuffer,
} from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (!files.length) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const useCloudinary = isCloudinaryConfigured();
    const urls: string[] = [];

    if (!useCloudinary) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
    }

    for (const file of files) {
      const ext = path.extname(file.name) || ".jpg";
      const id = randomUUID();
      const buffer = Buffer.from(await file.arrayBuffer());

      if (useCloudinary) {
        const url = await uploadImageBuffer(buffer, id);
        urls.push(url);
      } else {
        const filename = `${id}${ext}`;
        await writeFile(
          path.join(process.cwd(), "public", "uploads", filename),
          buffer,
        );
        urls.push(`/uploads/${filename}`);
      }
    }

    return NextResponse.json({ urls }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
