import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;

  if (!["team", "player"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const url = `https://api.sofascore.app/api/v1/${type}/${id}/image`;

  const response = await fetch(url, {
    headers: {
      Referer: "https://www.sofascore.com/",
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const imageBuffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "image/png";

  return new NextResponse(imageBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=604800, immutable",
    },
  });
}
