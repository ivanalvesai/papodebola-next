import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";

// Diz ao cliente se o usuário é admin logado (pro modo de edição inline aparecer
// só pra quem pode). Não expõe dados sensíveis.
export async function GET() {
  const session = await getSession();
  return NextResponse.json(
    { admin: !!session },
    { headers: { "Cache-Control": "no-store" } }
  );
}
