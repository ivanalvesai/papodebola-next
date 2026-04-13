import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { updateUser, deleteUser } from "@/lib/auth/users";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { username } = await params;

  try {
    const updates = await request.json();
    const updated = await updateUser(username, updates);

    if (!updated) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ username, updated: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { username } = await params;
  const deleted = await deleteUser(username);

  if (!deleted) {
    return NextResponse.json(
      { error: "Não é possível excluir este usuário" },
      { status: 400 }
    );
  }

  return NextResponse.json({ deleted: username });
}
