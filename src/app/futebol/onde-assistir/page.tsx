import type { Metadata } from "next";
import Image from "next/image";
import { getTodayMatches } from "@/lib/data/matches";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { Tv } from "lucide-react";
import type { NormalizedMatch } from "@/types/match";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Onde Assistir Futebol Hoje - Transmissão Ao Vivo",
  description:
    "Onde assistir aos jogos de futebol de hoje. TV aberta, pay-per-view e streaming. Brasileirão, Libertadores, Champions League e mais.",
};

// Mapeamento aproximado de transmissão por campeonato. Atualizar conforme acordos contratuais.
function getBroadcasters(league: string): string[] {
  const l = league.toLowerCase();
  if (l.includes("brasileir") && l.includes("série a")) return ["Premiere", "Globoplay", "Record", "SporTV"];
  if (l.includes("brasileir") && l.includes("série b")) return ["Premiere", "ESPN", "Disney+"];
  if (l.includes("copa do brasil")) return ["Globo", "SporTV", "Premiere", "Amazon Prime Video"];
  if (l.includes("libertadores")) return ["SBT", "Paramount+", "ESPN", "Disney+"];
  if (l.includes("sudamericana")) return ["ESPN", "Disney+", "Paramount+"];
  if (l.includes("champions")) return ["TNT Sports", "HBO Max", "SBT"];
  if (l.includes("europa league") || l.includes("conference")) return ["ESPN", "Disney+"];
  if (l.includes("premier")) return ["ESPN", "Disney+"];
  if (l.includes("la liga")) return ["ESPN", "Disney+"];
  if (l.includes("serie a") && l.includes("itáli")) return ["ESPN", "Disney+"];
  if (l.includes("bundesliga")) return ["OneFootball", "CazéTV"];
  if (l.includes("ligue 1")) return ["CazéTV"];
  if (l.includes("copa do mundo") || l.includes("mundial")) return ["Globo", "SporTV", "FIFA+"];
  if (l.includes("eliminat") || l.includes("sul-americ")) return ["SporTV", "Globoplay"];
  return [];
}

function groupByLeague(matches: NormalizedMatch[]) {
  const groups: Record<string, NormalizedMatch[]> = {};
  for (const m of matches) {
    const key = m.league || "Outros";
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, "pt-BR"));
}

export default async function OndeAssistirPage() {
  const matches = await getTodayMatches().catch(() => []);
  const grouped = groupByLeague(matches);

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8">
      <PageBreadcrumb
        className="mb-4"
        items={[
          { label: "Início", href: "/" },
          { label: "Futebol", href: "/futebol" },
          { label: "Onde Assistir" },
        ]}
      />
      <h1 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
        <Tv className="h-6 w-6 text-green" />
        Onde Assistir Futebol Hoje
      </h1>

      {matches.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border-custom p-8 text-center">
          <p className="text-text-muted text-sm">Nenhum jogo de futebol encontrado para hoje.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([league, items]) => {
            const broadcasters = getBroadcasters(league);
            return (
              <div key={league} className="bg-card-bg rounded-lg border border-border-custom overflow-hidden">
                <div className="px-4 py-3 bg-body border-b border-border-custom">
                  <h2 className="text-sm font-bold text-text-primary">{league}</h2>
                  {broadcasters.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {broadcasters.map((b) => (
                        <span
                          key={b}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-light text-green text-[11px] font-semibold rounded-full"
                        >
                          <Tv className="h-3 w-3" />
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="divide-y divide-border-light">
                  {items.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-16 text-center shrink-0 text-sm font-bold text-text-primary">
                        {m.time}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          {m.homeLogo && (
                            <Image src={m.homeLogo} alt="" width={20} height={20} className="rounded-full" unoptimized />
                          )}
                          <span className="font-semibold truncate">{m.homeTeam}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {m.awayLogo && (
                            <Image src={m.awayLogo} alt="" width={20} height={20} className="rounded-full" unoptimized />
                          )}
                          <span className="font-semibold truncate">{m.awayTeam}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <p className="text-[11px] text-text-muted text-center">
            As informações de transmissão podem variar. Consulte o site oficial do campeonato e da emissora para confirmação.
          </p>
        </div>
      )}
    </div>
  );
}
