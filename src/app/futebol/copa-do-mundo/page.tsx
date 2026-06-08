import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { TeamLogo } from "@/components/ui/team-logo";
import { getWorldCupData } from "@/lib/data/world-cup";
import type { StandingsGroup, StandingRow } from "@/types/standings";
import type { ChampionshipMatch } from "@/types/match";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Copa do Mundo 2026: tabela, grupos e jogos | Papo de Bola",
  description:
    "Acompanhe a Copa do Mundo 2026: classificação de todos os grupos, jogos por rodada, datas e horários (horário de Brasília).",
};

// Brasil nao tem horario de verao desde 2019 -> America/Sao_Paulo = UTC-3 fixo.
// Calculo manual evita depender de full-icu no node:alpine do container.
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
function brParts(ts: number) {
  const d = new Date((ts - 3 * 3600) * 1000);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  return {
    dayKey: `${dd}/${mm}`,
    label: `${WEEKDAYS[d.getUTCDay()]}, ${dd}/${mm}`,
    time: `${hh}:${mi}`,
  };
}

function GroupCard({ group }: { group: StandingsGroup }) {
  const rows = group.rows.slice(0, 4);
  return (
    <div className="bg-card-bg rounded-lg border border-border-custom overflow-hidden">
      <h3 className="text-sm font-bold text-text-primary px-3 py-2 border-b border-border-custom bg-body">
        {group.name}
      </h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-text-muted border-b border-border-light">
            <th className="text-left py-1.5 px-2 font-semibold">Selecao</th>
            <th className="py-1.5 px-1 font-semibold w-6">P</th>
            <th className="py-1.5 px-1 font-semibold w-6">J</th>
            <th className="py-1.5 px-1 font-semibold w-6">V</th>
            <th className="py-1.5 px-1 font-semibold w-6">E</th>
            <th className="py-1.5 px-1 font-semibold w-6">D</th>
            <th className="py-1.5 px-1 font-semibold w-7">SG</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: StandingRow, i: number) => (
            <tr
              key={r.teamId || i}
              className={`border-b border-border-light last:border-0 ${
                (r.pos || i + 1) <= 2 ? "border-l-2 border-l-green" : ""
              }`}
            >
              <td className="py-1.5 px-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 text-center text-[10px] font-semibold text-text-muted">
                    {r.pos || i + 1}
                  </span>
                  <TeamLogo teamId={r.teamId} size={18} />
                  <span className="font-semibold text-text-primary truncate max-w-[120px]">
                    {r.team}
                  </span>
                </div>
              </td>
              <td className="py-1.5 px-1 text-center font-bold text-text-primary">{r.pts}</td>
              <td className="py-1.5 px-1 text-center text-text-muted">{r.matches}</td>
              <td className="py-1.5 px-1 text-center text-text-muted">{r.wins}</td>
              <td className="py-1.5 px-1 text-center text-text-muted">{r.draws}</td>
              <td className="py-1.5 px-1 text-center text-text-muted">{r.losses}</td>
              <td className="py-1.5 px-1 text-center text-text-muted">
                {r.gd > 0 ? `+${r.gd}` : r.gd}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatchRow({ m }: { m: ChampionshipMatch }) {
  const finished = m.homeScore !== null && m.awayScore !== null;
  const { time } = brParts(m.timestamp);
  return (
    <div className="flex items-center gap-2 py-2.5 px-3 border-b border-border-light last:border-0">
      {/* Mandante */}
      <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
        <span className="text-xs font-semibold text-text-primary truncate text-right">
          {m.home}
        </span>
        <TeamLogo teamId={m.homeId} size={22} />
      </div>

      {/* Placar / horario */}
      <div className="shrink-0 text-center min-w-[52px]">
        {finished ? (
          <span className="text-sm font-bold text-text-primary">
            {m.homeScore} <span className="text-text-muted">x</span> {m.awayScore}
          </span>
        ) : (
          <span className="inline-block text-xs font-bold text-text-primary bg-body rounded px-2 py-0.5">
            {time}
          </span>
        )}
      </div>

      {/* Visitante */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <TeamLogo teamId={m.awayId} size={22} />
        <span className="text-xs font-semibold text-text-primary truncate">{m.away}</span>
      </div>
    </div>
  );
}

function Matchday({ name, matches }: { name: string; matches: ChampionshipMatch[] }) {
  if (matches.length === 0) return null;

  // agrupa por dia (mantendo a ordem cronologica ja vinda do data layer)
  const byDay: { key: string; label: string; matches: ChampionshipMatch[] }[] = [];
  for (const m of matches) {
    const { dayKey, label } = brParts(m.timestamp);
    const last = byDay[byDay.length - 1];
    if (last && last.key === dayKey) last.matches.push(m);
    else byDay.push({ key: dayKey, label, matches: [m] });
  }

  return (
    <div className="bg-card-bg rounded-lg border border-border-custom overflow-hidden">
      <h3 className="text-sm font-bold text-white px-4 py-2.5 bg-green">{name}</h3>
      {byDay.map((day) => (
        <div key={day.label}>
          <div className="text-[11px] font-bold uppercase tracking-wide text-text-muted px-3 py-1.5 bg-body border-b border-border-light">
            {day.label}
          </div>
          {day.matches.map((m) => (
            <MatchRow key={m.id} m={m} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default async function CopaDoMundoPage() {
  const { groups, matchdays } = await getWorldCupData();

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <PageBreadcrumb
        className="mb-4"
        items={[{ label: "Início", href: "/" }, { label: "Copa do Mundo 2026" }]}
      />

      <h1 className="text-xl font-bold text-text-primary mb-1 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-green" />
        Copa do Mundo 2026
      </h1>
      <p className="text-sm text-text-muted mb-6">
        Classificação dos grupos e jogos &middot; horários de Brasília. Os 2 primeiros de cada
        grupo avançam (destaque em verde).
      </p>

      {/* Grupos */}
      <h2 className="text-base font-bold text-text-primary mb-3">Fase de Grupos</h2>
      {groups.length === 0 ? (
        <p className="text-text-muted text-sm py-6">Classificação indisponível no momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {groups.map((g) => (
            <GroupCard key={g.name} group={g} />
          ))}
        </div>
      )}

      {/* Jogos */}
      <h2 className="text-base font-bold text-text-primary mb-3">Jogos</h2>
      {matchdays.every((md) => md.matches.length === 0) ? (
        <p className="text-text-muted text-sm py-6">Jogos indisponíveis no momento.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {matchdays.map((md) => (
            <Matchday key={md.round} name={md.name} matches={md.matches} />
          ))}
        </div>
      )}
    </div>
  );
}
