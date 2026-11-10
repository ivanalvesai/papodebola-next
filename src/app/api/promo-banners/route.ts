import { NextResponse } from "next/server";
import { getPromoBanners } from "@/lib/data/promo-banners";

// Fallback do banner promocional: páginas geradas no build (sem banco) não trazem o
// banner no HTML; o componente do cliente busca aqui. Público e cacheado.
export const revalidate = 300;

export async function GET() {
  const banners = await getPromoBanners();
  return NextResponse.json(
    { banners },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300", "X-Robots-Tag": "noindex" } }
  );
}
