import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (!files.length) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    const urls: string[] = [];

    if (!useBlob) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
    }

    for (const file of files) {
      const ext = path.extname(file.name) || ".jpg";
      const name = `cards/${randomUUID()}${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      if (useBlob) {
        const blob = await put(name, buffer, {
          access: "public",
          contentType: file.type || "image/jpeg",
          addRandomSuffix: false,
        });
        urls.push(blob.url);
      } else {
        const filename = path.basename(name);
        await writeFile(path.join(process.cwd(), "public", "uploads", filename), buffer);
        urls.push(`/uploads/${filename}`);
      }
    }

    return NextResponse.json({ urls }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
