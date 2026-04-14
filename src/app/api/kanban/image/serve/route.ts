import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(request: NextRequest) {
  const filename = request.nextUrl.searchParams.get("f") || "";

  // Sanitize: only allow alphanumeric, dash, underscore, dot
  if (!filename || !/^[\w.-]+$/.test(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  try {
    const filepath = join(process.cwd(), "data", "kanban-images", filename);
    const buffer = await readFile(filepath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}
