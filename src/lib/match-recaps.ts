import { articleHref } from "@/lib/config";

// Recaps editoriais ("VEJA COMO FOI") por jogo: event id (Sofascore/SportApi7) -> post no
// Payload ({categoria, slug}). Quando um jogo ENCERRADO tem recap aqui, a página de lance a
// lance mostra um CTA "VEJA COMO FOI" apontando pro post. A URL é montada por articleHref
// (mesma regra das notícias), então acompanha qualquer mudança de estrutura de URL.
const MATCH_RECAPS: Record<number, { category: string; slug: string }> = {
  // Brasil 2 x 1 Japão — 16-avos da Copa do Mundo 2026 (29/06)
  12813012: { category: "Copa do Mundo", slug: "brasil-2-x-1-japao-oitavas-copa-2026" },
};

export function matchRecapHref(eventId: number | undefined | null): string | null {
  if (!eventId) return null;
  const r = MATCH_RECAPS[eventId];
  return r ? articleHref(r.category, r.slug) : null;
}
