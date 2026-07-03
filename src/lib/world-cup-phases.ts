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
    slug: "terceiro-lugar",
    label: "3º Lugar",
    longLabel: "Disputa do 3º Lugar",
    href: `${FASE_PREFIX}/terceiro-lugar`,
    round: 9, // verificar o nº real quando a API criar o jogo (semis=7, final=8)
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

// Data (YYYY-MM-DD) a partir da qual cada fase eliminatória vira o "foco" da Copa — o
// banner/atalhos passam a apontar pra ela. Auto-avança sozinho (evita ficar preso numa
// fase quando a Copa progride). Ajustar se o calendário oficial mudar.
const PHASE_FOCUS_FROM: Record<string, string> = {
  "16-avos": "2026-06-28",
  oitavas: "2026-07-03",
  quartas: "2026-07-08",
  semifinais: "2026-07-13",
  final: "2026-07-17",
};
const FOCUS_ORDER = ["16-avos", "oitavas", "quartas", "semifinais", "final"];

// Fase eliminatória "atual" pela data de hoje (pula a disputa de 3º — o foco é a final).
export function currentKnockoutPhase(now: Date = new Date()): WorldCupPhase {
  const today = now.toISOString().slice(0, 10);
  let current = "16-avos";
  for (const slug of FOCUS_ORDER) {
    if ((PHASE_FOCUS_FROM[slug] || "9999-99-99") <= today) current = slug;
  }
  return PHASE_BY_SLUG[current];
}
