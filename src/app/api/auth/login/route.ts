import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/users";
import { signToken, setSessionCookie } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username e password são obrigatórios" },
        { status: 400 }
      );
    }

    const user = await authenticateUser(username, password);
    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    const token = await signToken({ username: user.username, role: user.role });
    await setSessionCookie(token);

    return NextResponse.json({
      token,
      username: user.username,
      role: user.role,
    });
  } catch {
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
