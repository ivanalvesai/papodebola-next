import Link from "next/link";
import Image from "next/image";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { ArrowRight, Calendar, Trophy, BarChart3, Tv, Users } from "lucide-react";
import { TeamLogo } from "@/components/ui/team-logo";
import type { TeamPageData } from "@/lib/data/team";

// Renderer dos blocos da collection `teams` (Payload). Cada bloco DINÂMICO lê os dados
// ao vivo já buscados (TeamPageData, via getTeamPageDataFor) — mesmos cards do cluster
// Série A, embrulhados. Blocos estáticos (texto/título) vêm do editor.
/* eslint-disable @typescript-eslint/no-explicit-any */

const card = "bg-card-bg rounded-lg border border-border-custom";

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      {title && <h2 className="text-base font-bold text-text-primary">{title}</h2>}
      {children}
    </section>
  );
}

function TodayMatch({ data, title }: { data: TeamPageData; title?: string }) {
  const m = data.todayMatch;
  if (!m) return null;
  return (
    <div className={`${card} border-green p-4`}>
      <h2 className="text-sm font-bold text-green uppercase mb-3">{title || "Jogo de Hoje"}</h2>
      <div className="flex items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <TeamLogo teamId={m.homeId} size={40} />
          <span className="text-xs font-semibold">{m.home}</span>
        </div>
        <div className="text-center">
          {m.homeScore !== null ? (
            <span className="text-2xl font-bold">{m.homeScore} - {m.awayScore}</span>
          ) : (
            <span className="text-lg font-bold text-text-muted">{m.time}</span>
          )}
          <div className="text-[10px] text-text-muted mt-1">{m.league}</div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <TeamLogo teamId={m.awayId} size={40} />
          <span className="text-xs font-semibold">{m.away}</span>
        </div>
      </div>
    </div>
  );
}

function Upcoming({ data, title, limit }: { data: TeamPageData; title?: string; limit?: number }) {
  const list = data.upcomingMatches.slice(0, limit || 5);
  return (
    <div className={card}>
      <h3 className="text-sm font-bold text-text-primary px-4 py-3 border-b border-border-custom">
        {title || "Próximos Jogos"}
      </h3>
      {list.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-4">Sem jogos agendados</p>
      ) : (
        <div className="divide-y divide-border-light">
          {list.map((m) => (
            <div key={m.id} className="px-4 py-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold truncate">{m.home}</span>
                <span className="text-text-muted mx-1">vs</span>
                <span className="font-semibold truncate text-right">{m.away}</span>
              </div>
              <div className="text-[10px] text-text-muted mt-0.5 flex justify-between">
                <span>{m.league}</span>
                <span>{m.date} {m.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Results({ data, title, limit }: { data: TeamPageData; title?: string; limit?: number }) {
  const list = data.recentMatches.slice(0, limit || 5);
  return (
    <div className={card}>
      <h3 className="text-sm font-bold text-text-primary px-4 py-3 border-b border-border-custom">
        {title || "Resultados Recentes"}
      </h3>
      {list.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-4">Sem resultados</p>
      ) : (
        <div className="divide-y divide-border-light">
          {list.map((m) => (
            <div key={m.id} className="px-4 py-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold truncate">{m.home}</span>
                <span className="font-bold mx-1">{m.homeScore} - {m.awayScore}</span>
                <span className="font-semibold truncate text-right">{m.away}</span>
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">{m.league} - {m.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Standing({ data, title }: { data: TeamPageData; title?: string }) {
  const s = data.standingPosition;
  if (!s) return null;
  const trnName = data.tournament?.name || "Brasileirão 2026";
  const trnHref = data.tournament ? `/futebol/${data.tournament.slug}` : "/futebol/brasileirao-serie-a";
  return (
    <div className={`${card} p-4`}>
      <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-green" />
        {title || trnName}
      </h3>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold text-green">{s.pos}o</div>
          <div className="text-xs text-text-muted">posicao</div>
        </div>
        <div className="text-right space-y-1">
          <div className="text-sm"><span className="font-bold">{s.pts}</span> <span className="text-text-muted text-xs">pts</span></div>
          <div className="text-sm"><span className="font-bold">{s.wins}</span> <span className="text-text-muted text-xs">V</span> <span className="font-bold">{s.draws}</span> <span className="text-text-muted text-xs">E</span> <span className="font-bold">{s.losses}</span> <span className="text-text-muted text-xs">D</span></div>
          <div className="text-sm"><span className="font-bold">{s.gf}</span> <span className="text-text-muted text-xs">gols</span></div>
        </div>
      </div>
      <Link href={trnHref} className="block text-center text-xs font-semibold text-green mt-3 hover:text-green-hover">
        Ver tabela completa &rarr;
      </Link>
    </div>
  );
}

function News({ data, title, limit }: { data: TeamPageData; title?: string; limit?: number }) {
  const list = data.news.slice(0, limit || 10);
  return (
    <div className={`${card} p-6`}>
      <h2 className="text-base font-bold text-text-primary mb-4">{title || `Notícias - ${data.name}`}</h2>
      {list.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-4">Nenhuma notícia encontrada</p>
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <Link key={a.slug} href={a.url} className="block py-2 border-b border-border-light last:border-0 hover:text-green transition-colors">
              <div className="text-sm font-semibold text-text-primary line-clamp-2">{a.rewrittenTitle}</div>
              <div className="text-[11px] text-text-muted mt-1">
                {new Date(a.pubDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Scorers({ data, title, limit }: { data: TeamPageData; title?: string; limit?: number }) {
  const list = data.topPlayers.slice(0, limit || 10);
  if (list.length === 0) return null;
  return (
    <div className={`${card} p-6`}>
      <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
        <Users className="h-4 w-4 text-green" />
        {title || `Principais Jogadores - ${data.name}`}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {list.map((p) => (
          <div key={p.player.id} className="flex items-center gap-3 p-3 bg-body rounded-lg">
            <Image src={`/api/player-img/${p.player.id}`} alt={p.player.name} width={40} height={40} className="rounded-full" unoptimized />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-text-primary truncate">{p.player.shortName || p.player.name}</div>
              <div className="text-[10px] text-text-muted">{p.goals} gols{p.rating ? ` | ${p.rating.toFixed(1)}` : ""}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhereToWatch({ data, title }: { data: TeamPageData; title?: string }) {
  const m = data.todayMatch || data.upcomingMatches[0] || null;
  return (
    <div className={`${card} p-6`}>
      <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
        <Tv className="h-4 w-4 text-green" />
        {title || `Onde Assistir ${data.name}`}
      </h3>
      {m ? (
        <>
          <div className="text-center mb-4">
            <div className="text-xs font-bold text-green uppercase mb-2">{m.league}</div>
            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-1.5"><TeamLogo teamId={m.homeId} size={40} /><span className="text-sm font-semibold">{m.home}</span></div>
              <div className="text-lg font-bold text-text-muted">{m.homeScore !== null ? `${m.homeScore} - ${m.awayScore}` : m.time}</div>
              <div className="flex flex-col items-center gap-1.5"><TeamLogo teamId={m.awayId} size={40} /><span className="text-sm font-semibold">{m.away}</span></div>
            </div>
            <div className="text-xs text-text-muted mt-2">{m.date}</div>
          </div>
          <div className="space-y-2 border-t border-border-custom pt-4">
            <div className="flex items-center gap-3 p-3 bg-body rounded-lg">
              <div className="w-10 h-10 rounded bg-green/10 flex items-center justify-center"><Tv className="h-5 w-5 text-green" /></div>
              <div><div className="text-sm font-semibold text-text-primary">Premiere</div><div className="text-xs text-text-muted">Pay-per-view - Brasileirão</div></div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-body rounded-lg">
              <div className="w-10 h-10 rounded bg-blue/10 flex items-center justify-center"><Tv className="h-5 w-5 text-blue" /></div>
              <div><div className="text-sm font-semibold text-text-primary">Globoplay</div><div className="text-xs text-text-muted">Streaming</div></div>
            </div>
            <p className="text-[11px] text-text-muted text-center mt-3">As informacoes de transmissao podem variar. Consulte o site oficial do campeonato para confirmacao.</p>
          </div>
        </>
      ) : (
        <p className="text-text-muted text-sm text-center py-4">Nenhum jogo proximo encontrado.</p>
      )}
    </div>
  );
}

function Lineup({ data, title }: { data: TeamPageData; title?: string }) {
  const m = data.todayMatch || data.upcomingMatches[0] || null;
  return (
    <div className="space-y-4">
      {m && (
        <div className={`${card} p-4`}>
          <div className="text-xs text-text-muted mb-2">Próximo jogo</div>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="font-semibold">{m.home}</span>
            <span className="text-text-muted">vs</span>
            <span className="font-semibold">{m.away}</span>
            <span className="text-text-muted">- {m.date} {m.time}</span>
          </div>
        </div>
      )}
      {data.topPlayers.length > 0 ? (
        <div className={`${card} p-6`}>
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-green" />
            {title || `Principais Jogadores - ${data.name}`}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.topPlayers.map((p) => (
              <div key={p.player.id} className="flex items-center gap-3 p-3 bg-body rounded-lg">
                <Image src={`/api/player-img/${p.player.id}`} alt={p.player.name} width={40} height={40} className="rounded-full" unoptimized />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-text-primary truncate">{p.player.shortName || p.player.name}</div>
                  <div className="text-[10px] text-text-muted">{p.goals} gols{p.rating ? ` | ${p.rating.toFixed(1)}` : ""}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-text-muted text-center mt-4">A escalacao confirmada sera divulgada proximo ao horario do jogo. Os jogadores acima sao os destaques da temporada 2026.</p>
        </div>
      ) : (
        <div className={`${card} p-8 text-center`}>
          <p className="text-text-muted text-sm">Escalacao do {data.name} ainda nao disponivel para esta temporada.</p>
        </div>
      )}
    </div>
  );
}

function ClusterLinks({ data }: { data: TeamPageData }) {
  const slug = data.slug;
  const links = [
    { href: `/futebol/times/${slug}/jogo-hoje`, label: "Jogo de Hoje", desc: `Veja se o ${data.name} joga hoje, horario e detalhes`, icon: Calendar },
    { href: `/futebol/times/${slug}/onde-assistir`, label: "Onde Assistir", desc: `Saiba onde assistir ao jogo do ${data.name} ao vivo`, icon: Tv },
    { href: `/futebol/times/${slug}/escalacao`, label: "Escalação", desc: `Escalação provável do ${data.name} para o próximo jogo`, icon: Users },
    { href: `/futebol/times/${slug}/proximos-jogos`, label: "Próximos Jogos", desc: `Calendário completo dos próximos jogos do ${data.name}`, icon: Calendar },
    { href: `/futebol/times/${slug}/estatisticas`, label: "Estatísticas 2026", desc: `Números, artilheiros e desempenho do ${data.name} em 2026`, icon: BarChart3 },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="group flex items-start gap-3 bg-card-bg rounded-lg border border-border-custom p-4 hover:border-green hover:shadow-sm transition-all">
          <link.icon className="h-5 w-5 text-green shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-text-primary group-hover:text-green transition-colors">{link.label}</div>
            <div className="text-xs text-text-muted mt-0.5">{link.desc}</div>
          </div>
          <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-green shrink-0 mt-0.5" />
        </Link>
      ))}
    </div>
  );
}

function Heading({ block }: { block: any }) {
  const Tag = block.level === "h3" ? "h3" : "h2";
  const size = block.level === "h3" ? "text-base" : "text-lg";
  return <Tag className={`pt-2 ${size} font-bold text-text-primary`}>{block.text}</Tag>;
}

function StaticText({ block }: { block: any }) {
  if (!block.content) return null;
  return (
    <div className={`${card} p-6 leading-relaxed text-text-secondary [&_a]:text-green [&_a:hover]:underline [&>p]:m-0 space-y-3`}>
      <RichText data={block.content} />
    </div>
  );
}

function Block({ block, data }: { block: any; data: TeamPageData }) {
  const t = block.title || undefined;
  switch (block.blockType) {
    case "teamTodayMatch": return <TodayMatch data={data} title={t} />;
    case "teamUpcoming": return <Upcoming data={data} title={t} limit={block.limit} />;
    case "teamResults": return <Results data={data} title={t} limit={block.limit} />;
    case "teamStanding": return <Standing data={data} title={t} />;
    case "teamNews": return <News data={data} title={t} limit={block.limit} />;
    case "teamScorers": return <Scorers data={data} title={t} limit={block.limit} />;
    case "teamWhereToWatch": return <WhereToWatch data={data} title={t} />;
    case "teamLineup": return <Lineup data={data} title={t} />;
    case "teamClusterLinks": return <ClusterLinks data={data} />;
    case "heading": return <Heading block={block} />;
    case "richText": return <StaticText block={block} />;
    default: return null;
  }
}

export function TeamBlockRenderer({
  data,
  blocks,
  heading,
}: {
  data: TeamPageData;
  blocks: any[];
  heading?: string;
}) {
  return (
    <div className="mx-auto max-w-[860px] px-4 py-6 space-y-5">
      {heading && <h1 className="text-xl font-bold text-text-primary">{heading}</h1>}
      {(blocks || []).map((b, i) => (
        <Block key={i} block={b} data={data} />
      ))}
    </div>
  );
}

// Layouts padrão por página — usados quando a aba do time está vazia no Payload, pra o
// time semeado já renderizar completo (igual ao cluster Série A) sem composição manual.
export const DEFAULT_TEAM_LAYOUTS: Record<string, any[]> = {
  hub: [
    { blockType: "teamClusterLinks" },
    { blockType: "teamTodayMatch" },
    { blockType: "teamStanding" },
    { blockType: "teamUpcoming", limit: 5 },
    { blockType: "teamResults", limit: 5 },
    { blockType: "teamNews", limit: 8 },
  ],
  jogoHoje: [{ blockType: "teamTodayMatch" }, { blockType: "teamUpcoming", limit: 5 }],
  ondeAssistir: [{ blockType: "teamWhereToWatch" }],
  escalacao: [{ blockType: "teamLineup" }],
  proximos: [{ blockType: "teamUpcoming", limit: 20 }],
  estatisticas: [{ blockType: "teamStanding" }, { blockType: "teamScorers", limit: 10 }],
};
