// CSS real do site pro canvas do Construtor (Puck): busca uma página pública simples no
// próprio servidor e devolve os <link> de CSS do build atual (os nomes mudam a cada deploy)
// + as classes do <html>/<body>. Só pra quem está logado no /cms.
import { getPayload } from "payload";
import config from "@payload-config";

export const dynamic = "force-dynamic";

const EMPTY = { hrefs: [] as string[], bodyClass: "", htmlClass: "" };

export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: req.headers });
    if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  } catch {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const port = process.env.PORT || 3000;
    const r = await fetch(`http://127.0.0.1:${port}/termos-de-uso`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    const html = await r.text();
    const hrefs = Array.from(new Set(Array.from(html.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g), (m) => m[1])));
    const bodyClass = html.match(/<body[^>]*\sclass="([^"]*)"/)?.[1] || "";
    const htmlClass = html.match(/<html[^>]*\sclass="([^"]*)"/)?.[1] || "";
    return Response.json({ hrefs, bodyClass, htmlClass }, { headers: { "Cache-Control": "private, max-age=600" } });
  } catch {
    return Response.json(EMPTY, { headers: { "Cache-Control": "no-store" } });
  }
}
