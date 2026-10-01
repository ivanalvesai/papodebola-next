// Guarda o bloco da mini-prévia do Construtor num store em memória (chave aleatória, TTL de
// 10 min, presa ao usuário que criou) e devolve a chave. O iframe abre
// /cms-block-preview?k=<chave> — o bloco nunca viaja na URL. Só pra quem está logado no
// /cms; só blocos do iframe (nunca embed/HTML); corpo até 200 KB.
import { getPayload } from "payload";
import config from "@payload-config";
import { MAX_PREVIEW_BODY, parsePreviewBody, previewStore } from "@/cms/puck/preview-guard";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };
const fail = (error: string, status: number) => Response.json({ error }, { status, headers: NO_STORE });

export async function POST(req: Request) {
  let userId: string | number;
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: req.headers });
    if (!user) return fail("Faça login no /cms.", 401);
    userId = user.id;
  } catch {
    return fail("Faça login no /cms.", 401);
  }
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > MAX_PREVIEW_BODY) return fail("Bloco grande demais pra prévia.", 413);
  let text: string;
  try {
    text = await req.text();
  } catch {
    return fail("Corpo inválido.", 400);
  }
  if (text.length > MAX_PREVIEW_BODY) return fail("Bloco grande demais pra prévia.", 413);
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return fail("JSON inválido.", 400);
  }
  const entry = parsePreviewBody(body);
  if (typeof entry === "string") return fail(entry, 400);
  return Response.json({ key: previewStore().put({ ...entry, userId }) }, { headers: NO_STORE });
}
