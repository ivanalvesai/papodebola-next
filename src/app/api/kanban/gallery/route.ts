import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { getTeamGallery } from "@/lib/services/image-agent";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const team = request.nextUrl.searchParams.get("team") || "";
  if (!team) return NextResponse.json({ error: "Parametro team obrigatorio" }, { status: 400 });

  const images = await getTeamGallery(team);
  return NextResponse.json({ images, team });
}
