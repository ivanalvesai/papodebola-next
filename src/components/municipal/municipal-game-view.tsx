import Link from "next/link";
import Image from "next/image";
import type { MunicipalGame } from "@/lib/data/municipal-game";
import { sponsorBannerHtml } from "@/lib/data/sponsor";
import { LiveBadge } from "./live-badge";
import { SponsorStrip } from "@/components/sponsors/sponsor-strip";

// Página de jogo do municipal com VÍDEO (ao vivo) + comentários editáveis, no layout dos
// jogos da Copa: escalação na esquerda, vídeo + lance a lance (textos/comentários) no meio,
// gols na direita. Server component (conteúdo estático vindo do CMS).

function ytId(url: string): string {
  if (!url) return "";
  const m = String(url).match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/))([\w-]{11})/
  );
  return m ? m[1] : "";
}

function TeamHead({ name, badge }: { name: string; badge: string }) {
  const initials = name.replace(/F\.?C\.?/gi, "").trim().slice(0, 3).toUpperCase();
  return (
    <div className="flex flex-1 flex-col items-center gap-2 text-center">
      {badge ? (
        <Image src={badge} alt={name} width={56} height={56} className="h-14 w-14 rounded-full object-contain" unoptimized priority />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-body text-xs font-bold text-text-muted">
          {initials}
        </div>
      )}
      <span className="text-sm font-bold text-text-primary">{name}</span>
    </div>
  );
}

// Cartões do jogador (amarelo/vermelho) — retângulos coloridos, igual à ficha do SisGel.
function Cards({ yellow, red }: { yellow: number; red: number }) {
  if (!yellow && !red) return null;
  return (
    <span className="ml-1.5 inline-flex gap-0.5 align-middle">
      {Array.from({ length: yellow }).map((_, i) => (
        <span key={`y${i}`} className="inline-block h-3 w-2 rounded-[1px] bg-yellow-400" title="Cartão amarelo" />
      ))}
      {Array.from({ length: red }).map((_, i) => (
        <span key={`r${i}`} className="inline-block h-3 w-2 rounded-[1px] bg-red-600" title="Cartão vermelho" />
      ))}
    </span>
  );
}

function Lineup({ title, players }: { title: string; players: MunicipalGame["homeLineup"] }) {
  return (
    <div className="rounded-lg border border-border-custom bg-card-bg">
      <h3 className="border-b border-border-custom px-4 py-2.5 text-sm font-bold uppercase text-green">{title}</h3>
      {players.length > 0 ? (
        <ul className="divide-y divide-border-light">
          {players.map((p, i) => (
            <li key={i} className="px-4 py-1.5 text-sm capitalize text-text-secondary">
              {p.name.toLowerCase()}
              <Cards yellow={p.yellow} red={p.red} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-3 text-sm text-text-muted">Escalação a definir.</p>
      )}
    </div>
  );
}

// Title-case PT-BR: minúsculo nas preposições (de/do/da...), preserva siglas (S.C., F.C.).
const PREP = new Set(["de", "do", "da", "dos", "das", "e"]);
function titleCase(s: string): string {
  return String(s || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => {
      if (/^[a-zà-ÿ]\.([a-zà-ÿ]\.)+$/i.test(w)) return w.toUpperCase(); // S.C., F.C.
      if (i > 0 && PREP.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

// Resumo textual do jogo encerrado (mesmo padrão da Copa) — bom pra SEO e leitura rápida.
function Recap({ game }: { game: MunicipalGame }) {
  if (game.homeScore == null || game.awayScore == null) return null;
  const hs = game.homeScore;
  const as = game.awayScore;
  const h = titleCase(game.home);
  const a = titleCase(game.away);
  let result: string;
  if (hs > as) result = `${h} venceu ${a} por ${hs} a ${as}`;
  else if (as > hs) result = `${a} venceu ${h} por ${as} a ${hs}`;
  else result = `${h} e ${a} empataram em ${hs} a ${as}`;
  const goals = game.goals.map(
    (g) => `${titleCase(g.player)}${g.ownGoal ? " (contra)" : ""}${g.goals > 1 ? ` (${g.goals})` : ""}`
  );
  const comp = [game.division, "Campeonato Municipal de Santana de Parnaíba"].filter(Boolean).join(" · ");
  return (
    <p className="mt-4 rounded-lg border border-border-custom bg-card-bg p-3 text-sm leading-relaxed text-text-secondary">
      <strong className="text-text-primary">{result}</strong> — {comp}.
      {goals.length > 0 && <> Gols: {goals.join(", ")}.</>}
    </p>
  );
}

// Gols do SisGel (quando o jogo já aconteceu). Casa em duas colunas (mandante/visitante).
function Goals({ goals }: { goals: MunicipalGame["goals"] }) {
  if (!goals.length) {
    return <p className="px-4 py-3 text-sm text-text-muted">Os gols aparecem aqui quando o jogo começar.</p>;
  }
  const home = goals.filter((g) => g.isHome);
  const away = goals.filter((g) => !g.isHome);
  const item = (g: MunicipalGame["goals"][number], i: number, right: boolean) => (
    <li key={i} className={`flex items-center gap-1.5 ${right ? "flex-row-reverse text-right" : ""}`}>
      <span>⚽</span>
      <span className="capitalize">{g.player.toLowerCase()}</span>
      {g.goals > 1 && <span className="text-text-muted">({g.goals})</span>}
      {g.ownGoal && <span className="text-text-muted">(contra)</span>}
    </li>
  );
  return (
    <div className="grid grid-cols-2 gap-3 p-4 text-sm text-text-secondary">
      <ul className="space-y-1.5">{home.length ? home.map((g, i) => item(g, i, false)) : <li className="text-text-muted">—</li>}</ul>
      <ul className="space-y-1.5">{away.length ? away.map((g, i) => item(g, i, true)) : <li className="text-text-muted text-right">—</li>}</ul>
    </div>
  );
}

// Renderiza os banners de uma posição (topo, acima do placar, etc.). Nada se vazio.
function Banners({ game, at }: { game: MunicipalGame; at: string }) {
  const list = game.banners.filter((b) => b.position === at);
  if (!list.length) return null;
  return (
    <>
      {list.map((b, i) => (
        <div key={i} dangerouslySetInnerHTML={{ __html: sponsorBannerHtml(b.sponsor, at) }} />
      ))}
    </>
  );
}

export function MunicipalGameView({ game }: { game: MunicipalGame }) {
  const id = ytId(game.youtubeUrl);
  const context = [game.division, game.roundLabel].filter(Boolean).join(" · ");

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <Banners game={game} at="top" />
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-text-muted">
        <Link href="/" className="hover:text-green">Início</Link>
        <span>/</span>
        <Link href="/sp/santana-de-parnaiba/municipal" className="hover:text-green">Municipal</Link>
        <span>/</span>
        <span className="text-text-secondary">{game.home} x {game.away}</span>
      </nav>

      <h1 className="mb-4 text-lg font-bold text-text-primary">
        {game.seo.h1 ? (
          game.seo.h1
        ) : (
          <>
            {game.home} x {game.away}
            <span className="ml-2 text-sm font-normal text-text-muted">
              {context ? `· ${context} ` : ""}· Futebol Municipal de Santana de Parnaíba
            </span>
          </>
        )}
      </h1>

      <Banners game={game} at="above-score" />

      {/* Placar / cabeçalho */}
      <div className="rounded-lg border border-border-custom bg-card-bg p-6">
        <div className="mb-4 flex items-center justify-center gap-2">
          {(game.division || game.roundLabel) && (
            <span className="text-sm font-bold uppercase tracking-wide text-green">
              {[game.division, game.roundLabel].filter(Boolean).join(" · ")}
            </span>
          )}
          <LiveBadge gameKey={`${game.dateSlug}/${game.slug}`} size="sm" />
        </div>
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          <TeamHead name={game.home} badge={game.homeBadge} />
          <div className="shrink-0 text-center">
            {game.homeScore != null && game.awayScore != null ? (
              <div className="text-3xl font-extrabold tabular-nums text-text-primary">
                {game.homeScore} <span className="text-text-muted">-</span> {game.awayScore}
              </div>
            ) : (
              <div className="text-2xl font-extrabold tabular-nums text-text-primary">{game.time || "x"}</div>
            )}
            {game.date && (
              <div className="text-xs text-text-muted">
                {game.date}
                {game.homeScore != null && game.time ? ` · ${game.time}` : ""}
              </div>
            )}
          </div>
          <TeamHead name={game.away} badge={game.awayBadge} />
        </div>
        {game.venue && <div className="mt-4 text-center text-sm text-text-muted">{game.venue}</div>}
      </div>

      {/* Resumo textual do resultado (aparece só com o jogo encerrado). */}
      <Recap game={game} />

      {/* 3 colunas: escalação | vídeo + comentários | gols */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_260px]">
        {/* Esquerda: escalação */}
        <div className="order-2 space-y-4 lg:order-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-text-primary">
            {game.seo.headingLineups || "Escalações"}
          </h2>
          <Lineup title={game.home} players={game.homeLineup} />
          <Lineup title={game.away} players={game.awayLineup} />
        </div>

        {/* Meio: vídeo + lance a lance (textos/comentários) */}
        <div className="order-1 space-y-5 lg:order-2">
          <Banners game={game} at="above-player" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-text-primary">
            {game.seo.headingPlayByPlay || "Lance a lance"}
          </h2>
          {id ? (
            <div className="relative overflow-hidden rounded-lg border border-border-custom bg-black" style={{ aspectRatio: "16 / 9" }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${id}`}
                title={`${game.home} x ${game.away}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
              <div className="pointer-events-none absolute left-2 top-2 z-10">
                <LiveBadge gameKey={`${game.dateSlug}/${game.slug}`} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-border-custom bg-body p-8 text-center text-sm text-text-muted" style={{ aspectRatio: "16 / 9" }}>
              A transmissão aparece aqui quando o vídeo for adicionado no /cms.
            </div>
          )}

          {game.contentHtml && (
            <div className="rounded-lg border border-border-custom bg-card-bg p-5">
              <div className="prose-article" dangerouslySetInnerHTML={{ __html: game.contentHtml }} />
            </div>
          )}
        </div>

        {/* Direita: gols */}
        <div className="order-3">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-primary">
            {game.seo.headingGoals || "Gols"}
          </h2>
          <div className="rounded-lg border border-border-custom bg-card-bg">
            <Goals goals={game.goals} />
          </div>
        </div>
      </div>

      {/* Banners de rodapé + faixa de patrocinadores (togglável no /cms por jogo). */}
      <div className="mt-6 space-y-4">
        <Banners game={game} at="footer" />
        {game.showSponsors && <SponsorStrip de="jogo-municipal" />}
      </div>

      {/* Estilos do conteúdo (parágrafos, imagens e o bloco de comentário verde). */}
      <style>{`
        .prose-article > :last-child { margin-bottom: 0; }
        .prose-article p { font-size: 16px; line-height: 1.8; margin: 0 0 16px; color: #4A5568; }
        .prose-article a { color: #00965E; }
        .prose-article a:hover { text-decoration: underline; }
        .prose-article img { max-width: 100%; height: auto; border-radius: 8px; }
        .prose-article .pdb-callout { padding: 14px 18px; border-radius: 8px; margin: 0 0 16px; border-left: 4px solid; }
        .prose-article .pdb-callout > :last-child { margin-bottom: 0; }
        .prose-article .pdb-callout-info { background: #eff6ff; border-color: #3b82f6; }
        .prose-article .pdb-callout-warning { background: #fffbeb; border-color: #f59e0b; }
        .prose-article .pdb-callout-highlight { background: #ecfdf5; border-color: #00965E; }
        .prose-article .pdb-callout-comment,
        .prose-article .pdb-callout-comment-plain { background: rgba(0,150,94,.05); border: 1px solid rgba(0,150,94,.4); }
        .prose-article .pdb-callout-comment::before {
          content: "💬 Comentário da Redação"; display: block; margin-bottom: 8px;
          font-size: 11px; font-weight: 700; letter-spacing: .03em; text-transform: uppercase; color: #00965E;
        }
      `}</style>
    </div>
  );
}
