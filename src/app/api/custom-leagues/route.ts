import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { getCustomLeagues, addCustomLeague, deleteCustomLeague } from "@/lib/data/custom-store";

export async function GET() {
  const leagues = await getCustomLeagues();
  return NextResponse.json({ leagues });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const { name } = await request.json();
  if (!name) return NextResponse.json({ error: "Nome e obrigatorio" }, { status: 400 });

  const league = await addCustomLeague(name);
  return NextResponse.json({ league });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const { id } = await request.json();
  const deleted = await deleteCustomLeague(id);
  if (!deleted) return NextResponse.json({ error: "Campeonato nao encontrado" }, { status: 404 });
  return NextResponse.json({ deleted: id });
}
