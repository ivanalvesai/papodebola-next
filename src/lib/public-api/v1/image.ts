import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { imageType } from "./image-type.ts";
import { fail } from "../envelope.ts";

// Mesmos arquivos que /api/team-img e /api/player-img usam no volume.
const FILES = {
  team: (id: number) => join(process.cwd(), "data", "team-images", `${id}.png`),
  player: (id: number) => join(process.cwd(), "data", "player-images", `${id}.webp`),
};
const ROUTE = { team: "team-img", player: "player-img" };
const CC = "public, max-age=2592000";

// Disco primeiro; se não houver, pede à rota do site (no container da API, PDB_IMG_ORIGIN aponta
// para o dev, que baixa e grava no volume). A API nunca grava.
export async function serveImage(kind: "team" | "player", id: number): Promise<Response> {
  try {
    const buf = await readFile(FILES[kind](id));
    const ct = imageType(buf);
    if (ct) return new Response(new Uint8Array(buf), { headers: { "content-type": ct, "cache-control": CC } });
  } catch {
    /* não está no disco */
  }
  const origin = process.env.PDB_IMG_ORIGIN || "http://127.0.0.1:3000";
  try {
    const r = await fetch(`${origin}/api/${ROUTE[kind]}/${id}`, { redirect: "manual", signal: AbortSignal.timeout(8000) });
    if (r.ok) {
      const buf = new Uint8Array(await r.arrayBuffer());
      const ct = imageType(buf);
      if (ct) return new Response(buf, { headers: { "content-type": ct, "cache-control": CC } });
    }
  } catch {
    /* origem fora */
  }
  return fail(404, "nao_encontrado", "Imagem não encontrada.");
}
