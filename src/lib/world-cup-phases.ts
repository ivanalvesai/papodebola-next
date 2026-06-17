// Fases da Copa do Mundo 2026 (48 seleções → mata-mata começa nos 16-avos).
// A fase de grupos vive no hub (/futebol/copa-do-mundo); cada fase eliminatória
// tem URL própria (/futebol/copa-do-mundo/fase/[fase]) — melhor pra SEO (cada
// fase rankeia separada, conteúdo no SSR, navegação crawlável entre elas).

export interface WorldCupPhase {
  slug: string;
  /** Rótulo curto (carrossel/nav). */
  label: string;
  /** Rótulo longo (H1/title/heading). */
  longLabel: string;
  href: string;
  /** Número da rodada na AllSportsApi. Grupos = 1-3; o mata-mata só ganha
   *  confrontos após o sorteio pós-grupos — confirmar os números quando o
   *  chaveamento existir (hoje retorna vazio e a página mostra placeholder). */
  round: number | null;
}

const FASE_PREFIX = "/futebol/copa-do-mundo/fase";

export const WC_PHASES: WorldCupPhase[] = [
  {
    slug: "grupos",
    label: "Fase de Grupos",
    longLabel: "Fase de Grupos",
    href: "/futebol/copa-do-mundo",
    round: null, // tratada à parte (rodadas 1-3) no hub
  },
  {
    slug: "16-avos",
    label: "16-avos",
    longLabel: "16-avos de Final",
    href: `${FASE_PREFIX}/16-avos`,
    round: 4,
  },
  {
    slug: "oitavas",
    label: "Oitavas",
    longLabel: "Oitavas de Final",
    href: `${FASE_PREFIX}/oitavas`,
    round: 5,
  },
  {
    slug: "quartas",
    label: "Quartas",
    longLabel: "Quartas de Final",
    href: `${FASE_PREFIX}/quartas`,
    round: 6,
  },
  {
    slug: "semifinais",
    label: "Semifinais",
    longLabel: "Semifinais",
    href: `${FASE_PREFIX}/semifinais`,
    round: 7,
  },
  {
    slug: "final",
    label: "Final",
    longLabel: "Final",
    href: `${FASE_PREFIX}/final`,
    round: 8,
  },
];

// Só as fases eliminatórias (têm página própria em /fase/[fase])
export const KNOCKOUT_PHASES = WC_PHASES.filter((p) => p.slug !== "grupos");

export const PHASE_BY_SLUG: Record<string, WorldCupPhase> = Object.fromEntries(
  WC_PHASES.map((p) => [p.slug, p])
);
