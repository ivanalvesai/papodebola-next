import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { getCustomGames, addCustomGame, updateCustomGame, deleteCustomGame } from "@/lib/data/custom-store";

export async function GET() {
  const games = await getCustomGames();
  return NextResponse.json({ games });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const game = await addCustomGame(body);
    return NextResponse.json({ game });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const { id, ...updates } = await request.json();
    const game = await updateCustomGame(id, updates);
    if (!game) return NextResponse.json({ error: "Jogo nao encontrado" }, { status: 404 });
    return NextResponse.json({ game });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const { id } = await request.json();
  const deleted = await deleteCustomGame(id);
  if (!deleted) return NextResponse.json({ error: "Jogo nao encontrado" }, { status: 404 });
  return NextResponse.json({ deleted: id });
}
