import type { ChampionshipData, RoundRef } from "@/types/tournament";
import type { Scorer } from "@/types/team";
import { fromChampionshipMatch, teamRef } from "./map-match.ts";
import type { CampeonatoResumoV1, CampeonatoV1, JogoResumoV1, ArtilheiroV1, RodadaRefV1 } from "./dto.ts";

type T = { slug: string; name: string; id: number; seasonId: number | null };
const FORM: Record<string, "V" | "E" | "D"> = { W: "V", D: "E", L: "D" };

export function toCampeonatoResumo(t: T): CampeonatoResumoV1 {
  return { slug: t.slug, nome: t.name, id: t.id, temporadaId: t.seasonId };
}

function rounds(d: ChampionshipData): RoundRef[] {
  if (d.roundList?.length) return d.roundList;
  return d.rounds.map((r) => ({ key: String(r), round: r, label: `Rodada ${r}`, knockout: false }));
}

export function hasLiveMatch(d: ChampionshipData): boolean {
  return Object.values(d.matchesByRound || {}).some((list) => list.some((m) => m.status === "inprogress"));
}

export function toCampeonato(t: T, d: ChampionshipData): CampeonatoV1 {
  const rodadas: RodadaRefV1[] = rounds(d).map((r) => ({ chave: r.key, numero: r.round, nome: r.label, mataMata: r.knockout }));
  return {
    ...toCampeonatoResumo(t),
    rodadaAtual: d.currentRoundKey || String(d.currentRound),
    rodadas,
    tabela: (d.standings || []).map((g) => ({
      nome: g.name,
      linhas: g.rows.map((r) => ({
        posicao: r.pos, time: teamRef(r.teamId, r.team), pontos: r.pts, jogos: r.matches, vitorias: r.wins,
        empates: r.draws, derrotas: r.losses, golsPro: r.gf, golsContra: r.ga, saldo: r.gd, zona: r.promo,
        variacao: r.posChange, ultimos: (r.recentForm || []).map((f) => FORM[f]).filter(Boolean),
      })),
    })),
    temJogoAoVivo: hasLiveMatch(d),
  };
}

export function toRodada(d: ChampionshipData, chave: string): JogoResumoV1[] | null {
  const list = d.matchesByRound?.[chave];
  if (!list) return null;
  return list.map((m) => fromChampionshipMatch(m, d.tournament.name)).sort((a, b) => a.inicioTs - b.inicioTs);
}

export function toArtilharia(list: Scorer[]): ArtilheiroV1[] {
  return list.map((s, i) => ({
    posicao: i + 1,
    jogador: { id: s.player.id, nome: s.player.name, foto: `/v1/imagens/jogador/${s.player.id}` },
    time: teamRef(s.team.id, s.team.name), gols: s.goals, nota: s.rating,
  }));
}
