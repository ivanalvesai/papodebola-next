import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

// ⚠️ ROTA TEMPORÁRIA — semeia os 20 times do Brasileirão Série B 2026 na collection
// `teams` do Payload (local API, idempotente). Protegida por REVALIDATION_SECRET.
// REMOVER após o seed (antes de promover pra prod). Ver docs/knowledge/2026-06-26-times-serie-b-payload.md
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TEAMS = [
  { name: "Vila Nova", slug: "vila-nova", sofascoreId: 2021 },
  { name: "São Bernardo", slug: "sao-bernardo", sofascoreId: 47504 },
  { name: "Sport", slug: "sport-recife", sofascoreId: 1959 },
  { name: "Novorizontino", slug: "novorizontino", sofascoreId: 135514 },
  { name: "Criciúma", slug: "criciuma", sofascoreId: 1984 },
  { name: "Juventude", slug: "juventude", sofascoreId: 1980 },
  { name: "Operário-PR", slug: "operario-pr", sofascoreId: 39634 },
  { name: "Fortaleza", slug: "fortaleza", sofascoreId: 2020 },
  { name: "Náutico", slug: "nautico", sofascoreId: 2011 },
  { name: "Cuiabá", slug: "cuiaba", sofascoreId: 49202 },
  { name: "Athletic", slug: "athletic-club", sofascoreId: 342775 },
  { name: "Goiás", slug: "goias", sofascoreId: 1960 },
  { name: "Atlético-GO", slug: "atletico-goianiense", sofascoreId: 7314 },
  { name: "Ceará", slug: "ceara", sofascoreId: 2001 },
  { name: "Botafogo-SP", slug: "botafogo-sp", sofascoreId: 1979 },
  { name: "CRB", slug: "crb", sofascoreId: 22032 },
  { name: "Londrina", slug: "londrina", sofascoreId: 2022 },
  { name: "Avaí", slug: "avai", sofascoreId: 7315 },
  { name: "Ponte Preta", slug: "ponte-preta", sofascoreId: 1969 },
  { name: "América-MG", slug: "america-mineiro", sofascoreId: 1973 },
];

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("secret") !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const payload = await getPayload({ config });
    const results: string[] = [];
    for (const t of TEAMS) {
      const data = { ...t, tournament: "serie-b", _status: "published" } as Record<string, unknown>;
      const existing = await payload.find({
        collection: "teams",
        where: { slug: { equals: t.slug } },
        limit: 1,
      });
      if (existing.docs[0]) {
        await payload.update({ collection: "teams", id: existing.docs[0].id, data });
        results.push(`~ ${t.slug}`);
      } else {
        await payload.create({ collection: "teams", data });
        results.push(`+ ${t.slug}`);
      }
    }
    return NextResponse.json({ ok: true, count: results.length, results });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
