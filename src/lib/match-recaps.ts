// Recaps editoriais ("VEJA COMO FOI") por jogo: event id (Sofascore/SportApi7) -> post no
// Payload ({categoria, slug}). Quando um jogo tem recap aqui E o post está PUBLICADO, a
// página de lance a lance mostra um CTA "VEJA COMO FOI" apontando pro post (a checagem de
// publicação é feita na página, pra não gerar link quebrado enquanto o post é rascunho).
export type MatchRecap = { category: string; slug: string };

const MATCH_RECAPS: Record<number, MatchRecap> = {
  // Brasil 2 x 1 Japão — 16-avos da Copa do Mundo 2026 (29/06)
  12813012: { category: "Copa do Mundo", slug: "brasil-2-x-1-japao-oitavas-copa-2026" },
};

export function getMatchRecap(eventId: number | undefined | null): MatchRecap | null {
  if (!eventId) return null;
  return MATCH_RECAPS[eventId] ?? null;
}
