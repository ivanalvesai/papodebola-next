import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { slugifyCategory, WP_CATEGORY_BY_SLUG } from "@/lib/config";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "papodebola-dev-secret"
);

const PANEL_PATH = "/painel-pdb-9x";

export async function middleware(request: NextRequest) {
  const protectedPaths = [PANEL_PATH, "/studio-pdb", "/api/kanban", "/api/promote", "/api/push/send", "/api/page-overrides"];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));
  const isLogin = request.nextUrl.pathname.startsWith(`${PANEL_PATH}/login`);

  if (isProtected && !isLogin) {
    const token = request.cookies.get("pdb_auth")?.value;
    const isApi = request.nextUrl.pathname.startsWith("/api/");

    if (!token) {
      return isApi
        ? NextResponse.json({ error: "nao autenticado" }, { status: 401 })
        : NextResponse.redirect(new URL(`${PANEL_PATH}/login`, request.url));
    }

    try {
      await jwtVerify(token, SECRET);
    } catch {
      return isApi
        ? NextResponse.json({ error: "sessao expirada" }, { status: 401 })
        : NextResponse.redirect(new URL(`${PANEL_PATH}/login`, request.url));
    }
  }

  // Block access to old /admin path
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  // Redireciona o ?cat= legado pras URLs limpas (/noticias/brasileirao) — 308.
  // Em middleware pra garantir o redirect real antes do cache (a pagina /noticias
  // e estatica e nao re-roda no runtime por query string).
  if (request.nextUrl.pathname === "/noticias") {
    const cat = request.nextUrl.searchParams.get("cat");
    if (cat) {
      const slug = slugifyCategory(cat);
      if (WP_CATEGORY_BY_SLUG[slug]) {
        const url = request.nextUrl.clone();
        url.pathname = `/noticias/${slug}`;
        url.searchParams.delete("cat");
        return NextResponse.redirect(url, 308);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/painel-pdb-9x/:path*",
    "/studio-pdb/:path*",
    "/api/kanban/:path*",
    "/api/promote/:path*",
    "/api/push/send/:path*",
    "/api/page-overrides/:path*",
    "/admin/:path*",
    "/noticias",
  ],
};
