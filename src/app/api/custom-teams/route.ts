import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { getCustomTeams, addCustomTeam, deleteCustomTeam } from "@/lib/data/custom-store";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function GET() {
  const teams = await getCustomTeams();
  return NextResponse.json({ teams });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const { name, shortName, badgeData, badgeFilename } = await request.json();

    if (!name) return NextResponse.json({ error: "Nome e obrigatorio" }, { status: 400 });

    let badge = "";
    if (badgeData && badgeFilename) {
      const safeName = badgeFilename.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
      const dir = join(process.cwd(), "public", "escudos");
      await mkdir(dir, { recursive: true });
      const buffer = Buffer.from(badgeData, "base64");
      await writeFile(join(dir, safeName), buffer);
      badge = `/escudos/${safeName}`;
    }

    const team = await addCustomTeam({ name, shortName: shortName || name, badge });
    return NextResponse.json({ team });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const { id } = await request.json();
  const deleted = await deleteCustomTeam(id);
  if (!deleted) return NextResponse.json({ error: "Time nao encontrado" }, { status: 404 });
  return NextResponse.json({ deleted: id });
}
