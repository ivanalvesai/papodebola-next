// Guarda o bloco da mini-prévia do Construtor num store em memória (chave aleatória, TTL de
// 10 min) e devolve a chave. O iframe abre /cms-block-preview?k=<chave> — o bloco nunca
// viaja na URL. Só pra quem está logado no /cms; só blocos do iframe (nunca embed/HTML).
import { getPayload } from "payload";
import config from "@payload-config";
import { parsePreviewBody, previewStore } from "@/cms/puck/preview-guard";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: req.headers });
    if (!user) return Response.json({ error: "Faça login no /cms." }, { status: 401, headers: NO_STORE });
  } catch {
    return Response.json({ error: "Faça login no /cms." }, { status: 401, headers: NO_STORE });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400, headers: NO_STORE });
  }
  const entry = parsePreviewBody(body);
  if (typeof entry === "string") return Response.json({ error: entry }, { status: 400, headers: NO_STORE });
  return Response.json({ key: previewStore().put(entry) }, { headers: NO_STORE });
}
