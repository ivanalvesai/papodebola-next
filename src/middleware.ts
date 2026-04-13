import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "papodebola-dev-secret"
);

const PANEL_PATH = "/painel-pdb-9x";

export async function middleware(request: NextRequest) {
  const protectedPaths = [PANEL_PATH, "/studio-pdb", "/api/kanban"];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));
  const isLogin = request.nextUrl.pathname.startsWith(`${PANEL_PATH}/login`);

  if (isProtected && !isLogin) {
    const token = request.cookies.get("pdb_auth")?.value;

    if (!token) {
      return NextResponse.redirect(new URL(`${PANEL_PATH}/login`, request.url));
    }

    try {
      await jwtVerify(token, SECRET);
    } catch {
      return NextResponse.redirect(new URL(`${PANEL_PATH}/login`, request.url));
    }
  }

  // Block access to old /admin path
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel-pdb-9x/:path*", "/studio-pdb/:path*", "/api/kanban/:path*", "/admin/:path*"],
};
