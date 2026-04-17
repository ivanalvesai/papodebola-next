import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = "https://allsportsapi2.p.rapidapi.com/api";

// Respostas de matches/{date} e {sport}/matches/{date} chegam a 14MB (excede limite de
// 2MB do Next.js data cache, invalidando o cache e queimando quota). Extraímos só os
// campos consumidos por src/lib/data/matches.ts + home.ts + championship.ts.
function slimTeam(t: any) {
  if (!t) return t;
  return { id: t.id, name: t.name, nameCode: t.nameCode, slug: t.slug };
}

function slimEvent(e: any) {
  if (!e) return e;
  return {
    id: e.id,
    homeTeam: slimTeam(e.homeTeam),
    awayTeam: slimTeam(e.awayTeam),
    homeScore: e.homeScore ? { current: e.homeScore.current } : null,
    awayScore: e.awayScore ? { current: e.awayScore.current } : null,
    status: e.status
      ? { type: e.status.type, code: e.status.code, description: e.status.description }
      : null,
    tournament: e.tournament
      ? {
          id: e.tournament.id,
          name: e.tournament.name,
          category: e.tournament.category ? { name: e.tournament.category.name } : null,
          uniqueTournament: e.tournament.uniqueTournament
            ? {
                id: e.tournament.uniqueTournament.id,
                name: e.tournament.uniqueTournament.name,
              }
            : null,
        }
      : null,
    startTimestamp: e.startTimestamp,
    roundInfo: e.roundInfo ? { round: e.roundInfo.round } : undefined,
  };
}

function trimBody(body: string): string {
  if (body.length < 500_000) return body; // payloads pequenos passam direto
  try {
    const json = JSON.parse(body);
    if (Array.isArray(json?.events)) {
      json.events = json.events.map(slimEvent);
      return JSON.stringify(json);
    }
  } catch {
    // fallthrough: retorna raw
  }
  return body;
}

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

    const rawBody = await res.text();
    const ct = res.headers.get("content-type") || "application/json";
    const body = ct.includes("application/json") && res.ok ? trimBody(rawBody) : rawBody;

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
