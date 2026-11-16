import { withPublicApiRaw } from "@/lib/public-api/with-public-api";
import { parseId } from "@/lib/public-api/v1/sources";
import { serveImage } from "@/lib/public-api/v1/image";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApiRaw<{ id: string }>("imagem-time", async (_req, { id }) => serveImage("team", parseId(id)));
