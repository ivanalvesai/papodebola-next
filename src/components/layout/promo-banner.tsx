import { getPromoBanners } from "@/lib/data/promo-banners";
import { PromoBannerClient } from "./promo-banner-client";

// Faixa promocional abaixo do menu, em todas as páginas (/cms → Banners promocionais).
// O servidor manda os candidatos; o navegador confere o período e sorteia um.
export async function PromoBanner() {
  const banners = await getPromoBanners();
  const now = Date.now();
  const first = banners.find(
    (b) =>
      b.hasLink &&
      (!b.startsAt || Date.parse(b.startsAt) <= now) &&
      (!b.endsAt || Date.parse(b.endsAt) > now)
  );
  return <PromoBannerClient banners={banners} initialSlug={first?.slug ?? null} />;
}
