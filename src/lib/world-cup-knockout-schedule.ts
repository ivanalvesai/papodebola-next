// Calendário FIXO do mata-mata da Copa do Mundo 2026 (datas, estádios e slots por
// posição de grupo / vencedor de jogo). Fonte: FIFA (CALENDARIO-FIFA.md).
//
// Uso: enquanto a API não cria os jogos eliminatórios (só vêm depois da fase de
// grupos), as páginas de fase renderizam ESTE calendário como placeholder — com
// data, local e "Aguardando 2º do Grupo A" etc. Quando a API popular os confrontos
// reais, o código troca pelo jogo de verdade (mesma URL/página → SEO preservado).

import type { ChampionshipMatch } from "@/types/match";

export type KnockoutPhaseSlug =
  | "16-avos"
  | "oitavas"
  | "quartas"
  | "semifinais"
  | "terceiro-lugar"
  | "final";

// Item renderizado na página de fase: jogo REAL (quando a API já criou o confronto)
// ou PLACEHOLDER (calendário fixo, enquanto os times não estão definidos).
export type KnockoutItem =
  | { kind: "real"; match: ChampionshipMatch }
  | { kind: "placeholder"; sched: KnockoutScheduleMatch };

export interface KnockoutScheduleMatch {
  game: number; // nº oficial FIFA (73–104)
  phase: KnockoutPhaseSlug;
  date: string; // data do jogo, YYYY-MM-DD (sem horário no calendário oficial)
  city: string;
  country: string; // "EUA" | "México" | "Canadá"
  homeSlot: string; // rótulo do mandante enquanto o time não está definido
  awaySlot: string;
  thirdPlace?: boolean; // disputa de 3º lugar (vai na página da "final")
}

export const KNOCKOUT_SCHEDULE: KnockoutScheduleMatch[] = [
  // ===== 16-avos de final =====
  { game: 73, phase: "16-avos", date: "2026-06-28", city: "Los Angeles", country: "EUA", homeSlot: "2º do Grupo A", awaySlot: "2º do Grupo B" },
  { game: 74, phase: "16-avos", date: "2026-06-29", city: "Boston", country: "EUA", homeSlot: "1º do Grupo E", awaySlot: "3º (Grupos A/B/C/D/F)" },
  { game: 75, phase: "16-avos", date: "2026-06-29", city: "Monterrey", country: "México", homeSlot: "1º do Grupo F", awaySlot: "2º do Grupo C" },
  { game: 76, phase: "16-avos", date: "2026-06-29", city: "Houston", country: "EUA", homeSlot: "1º do Grupo C", awaySlot: "2º do Grupo F" },
  { game: 77, phase: "16-avos", date: "2026-06-30", city: "Nova York/Nova Jersey", country: "EUA", homeSlot: "1º do Grupo I", awaySlot: "3º (Grupos C/D/F/G/H)" },
  { game: 78, phase: "16-avos", date: "2026-06-30", city: "Dallas", country: "EUA", homeSlot: "2º do Grupo E", awaySlot: "2º do Grupo I" },
  { game: 79, phase: "16-avos", date: "2026-06-30", city: "Cidade do México", country: "México", homeSlot: "1º do Grupo A", awaySlot: "3º (Grupos C/E/F/H/I)" },
  { game: 80, phase: "16-avos", date: "2026-07-01", city: "Atlanta", country: "EUA", homeSlot: "1º do Grupo L", awaySlot: "3º (Grupos E/H/I/J/K)" },
  { game: 81, phase: "16-avos", date: "2026-07-01", city: "Santa Clara (Baía de San Francisco)", country: "EUA", homeSlot: "1º do Grupo D", awaySlot: "3º (Grupos B/E/F/I/J)" },
  { game: 82, phase: "16-avos", date: "2026-07-01", city: "Seattle", country: "EUA", homeSlot: "1º do Grupo G", awaySlot: "3º (Grupos A/E/H/I/J)" },
  { game: 83, phase: "16-avos", date: "2026-07-02", city: "Toronto", country: "Canadá", homeSlot: "2º do Grupo K", awaySlot: "2º do Grupo L" },
  { game: 84, phase: "16-avos", date: "2026-07-02", city: "Los Angeles", country: "EUA", homeSlot: "1º do Grupo H", awaySlot: "2º do Grupo J" },
  { game: 85, phase: "16-avos", date: "2026-07-02", city: "Vancouver", country: "Canadá", homeSlot: "1º do Grupo B", awaySlot: "3º (Grupos E/F/G/I/J)" },
  { game: 86, phase: "16-avos", date: "2026-07-03", city: "Miami", country: "EUA", homeSlot: "1º do Grupo J", awaySlot: "2º do Grupo H" },
  { game: 87, phase: "16-avos", date: "2026-07-03", city: "Kansas City", country: "EUA", homeSlot: "1º do Grupo K", awaySlot: "3º (Grupos D/E/I/J/L)" },
  { game: 88, phase: "16-avos", date: "2026-07-03", city: "Dallas", country: "EUA", homeSlot: "2º do Grupo D", awaySlot: "2º do Grupo G" },

  // ===== Oitavas de final =====
  { game: 89, phase: "oitavas", date: "2026-07-04", city: "Filadélfia", country: "EUA", homeSlot: "Vencedor do Jogo 74", awaySlot: "Vencedor do Jogo 77" },
  { game: 90, phase: "oitavas", date: "2026-07-04", city: "Houston", country: "EUA", homeSlot: "Vencedor do Jogo 73", awaySlot: "Vencedor do Jogo 75" },
  { game: 91, phase: "oitavas", date: "2026-07-05", city: "Nova York/Nova Jersey", country: "EUA", homeSlot: "Vencedor do Jogo 76", awaySlot: "Vencedor do Jogo 78" },
  { game: 92, phase: "oitavas", date: "2026-07-05", city: "Cidade do México", country: "México", homeSlot: "Vencedor do Jogo 79", awaySlot: "Vencedor do Jogo 80" },
  { game: 93, phase: "oitavas", date: "2026-07-06", city: "Dallas", country: "EUA", homeSlot: "Vencedor do Jogo 83", awaySlot: "Vencedor do Jogo 84" },
  { game: 94, phase: "oitavas", date: "2026-07-06", city: "Seattle", country: "EUA", homeSlot: "Vencedor do Jogo 81", awaySlot: "Vencedor do Jogo 82" },
  { game: 95, phase: "oitavas", date: "2026-07-07", city: "Atlanta", country: "EUA", homeSlot: "Vencedor do Jogo 86", awaySlot: "Vencedor do Jogo 88" },
  { game: 96, phase: "oitavas", date: "2026-07-07", city: "Vancouver", country: "Canadá", homeSlot: "Vencedor do Jogo 85", awaySlot: "Vencedor do Jogo 87" },

  // ===== Quartas de final =====
  { game: 97, phase: "quartas", date: "2026-07-09", city: "Boston", country: "EUA", homeSlot: "Vencedor do Jogo 89", awaySlot: "Vencedor do Jogo 90" },
  { game: 98, phase: "quartas", date: "2026-07-10", city: "Los Angeles", country: "EUA", homeSlot: "Vencedor do Jogo 93", awaySlot: "Vencedor do Jogo 94" },
  { game: 99, phase: "quartas", date: "2026-07-12", city: "Miami", country: "EUA", homeSlot: "Vencedor do Jogo 91", awaySlot: "Vencedor do Jogo 92" },
  { game: 100, phase: "quartas", date: "2026-07-12", city: "Kansas City", country: "EUA", homeSlot: "Vencedor do Jogo 95", awaySlot: "Vencedor do Jogo 96" },

  // ===== Semifinais =====
  { game: 101, phase: "semifinais", date: "2026-07-14", city: "Dallas", country: "EUA", homeSlot: "Vencedor do Jogo 97", awaySlot: "Vencedor do Jogo 98" },
  { game: 102, phase: "semifinais", date: "2026-07-15", city: "Atlanta", country: "EUA", homeSlot: "Vencedor do Jogo 99", awaySlot: "Vencedor do Jogo 100" },

  // ===== Disputa de 3º lugar (página própria) =====
  { game: 103, phase: "terceiro-lugar", date: "2026-07-18", city: "Miami", country: "EUA", homeSlot: "Perdedor do Jogo 101", awaySlot: "Perdedor do Jogo 102", thirdPlace: true },

  // ===== Final =====
  { game: 104, phase: "final", date: "2026-07-19", city: "Nova York/Nova Jersey", country: "EUA", homeSlot: "Vencedor do Jogo 101", awaySlot: "Vencedor do Jogo 102" },
];

const WD = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Rótulo de data PT a partir do YYYY-MM-DD (sem horário). Ex: "Dom, 28/06".
export function knockoutDateLabel(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${WD[dt.getUTCDay()]}, ${p(d)}/${p(m)}`;
}

export function knockoutVenueLabel(s: KnockoutScheduleMatch): string {
  return `${s.city}, ${s.country}`;
}
