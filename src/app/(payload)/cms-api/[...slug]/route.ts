/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* EDITADO À MÃO: wrapper do GET pra mídia ausente (301 pro .webp ou 404). Se o Payload
   regenerar este arquivo, reaplicar o wrapper. */
import { existsSync } from "fs";
import path from "path";
import config from "@payload-config";
import "@payloadcms/next/css";
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from "@payloadcms/next/routes";
import { webpFallbackName } from "@/lib/media-fallback";

const MEDIA_PREFIX = "/cms-api/media/file/";
const MEDIA_DIR = path.resolve(process.cwd(), "data/cms-media");

const payloadGET = REST_GET(config);

// Arquivo de mídia pedido pelo nome original (.jpg/.png) depois da conversão pra WebP:
// o handler do Payload estoura 500. Se o .webp existe → 301 (o Google Imagens migra);
// senão → 404 (some do índice) em vez de erro de servidor.
export const GET: typeof payloadGET = async (req, ctx) => {
  const res = await payloadGET(req, ctx);
  const { pathname } = new URL(req.url);
  if (res.status < 500 || !pathname.startsWith(MEDIA_PREFIX)) return res;
  const name = decodeURIComponent(pathname.slice(MEDIA_PREFIX.length));
  const webp = webpFallbackName(name);
  if (webp && existsSync(path.join(MEDIA_DIR, webp))) {
    // Location relativo: atrás do nginx o req.url traz o host interno (0.0.0.0:3000).
    return new Response(null, { status: 301, headers: { Location: MEDIA_PREFIX + encodeURIComponent(webp) } });
  }
  return new Response("Not found", { status: 404 });
};
export const POST = REST_POST(config);
export const DELETE = REST_DELETE(config);
export const PATCH = REST_PATCH(config);
export const PUT = REST_PUT(config);
export const OPTIONS = REST_OPTIONS(config);
