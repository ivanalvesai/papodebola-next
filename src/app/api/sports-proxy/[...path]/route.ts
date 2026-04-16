import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = "https://allsportsapi2.p.rapidapi.com/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const auth = request.headers.get("x-proxy-auth");
  const expected = process.env.SPORTS_PROXY_TOKEN;

  if (!expected) {
    return NextResponse.json({ error: "proxy not configured" }, { status: 500 });
  }
  if (auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { path } = await params;
  const endpoint = path.join("/");
  const search = request.nextUrl.search || "";
  const upstream = `${UPSTREAM_BASE}/${endpoint}${search}`;

  try {
    const res = await fetch(upstream, {
      headers: {
        "x-rapidapi-key": process.env.ALLSPORTS_API_KEY!,
        "x-rapidapi-host": process.env.ALLSPORTS_API_HOST!,
      },
      next: { revalidate: 1800 },
    });

    const body = await res.text();
    const ct = res.headers.get("content-type") || "application/json";

    return new NextResponse(body, {
      status: res.status,
      headers: {
        "content-type": ct,
        "x-proxy-cache-hint": "1800",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "upstream fetch failed", detail: String(e) },
      { status: 502 }
    );
  }
}
