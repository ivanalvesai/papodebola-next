import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { getAllUsers, createUser } from "@/lib/auth/users";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const users = await getAllUsers();
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const { username, password, role } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username e password são obrigatórios" },
        { status: 400 }
      );
    }

    const created = await createUser(username, password, role || "editor");
    if (!created) {
      return NextResponse.json(
        { error: "Usuário já existe" },
        { status: 409 }
      );
    }

    return NextResponse.json({ username, role: role || "editor" });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
