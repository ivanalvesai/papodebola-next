import Link from "next/link";
import Image from "next/image";
import type { MunicipalGame } from "@/lib/data/municipal-game";
import { LiveBadge } from "./live-badge";

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
        <Image src={badge} alt={name} width={56} height={56} className="h-14 w-14 rounded-full object-contain" unoptimized />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-body text-xs font-bold text-text-muted">
          {initials}
        </div>
      )}
      <span className="text-sm font-bold text-text-primary">{name}</span>
    </div>
  );
}

function Lineup({ title, players }: { title: string; players: string[] }) {
  return (
    <div className="rounded-lg border border-border-custom bg-card-bg">
      <h3 className="border-b border-border-custom px-4 py-2.5 text-xs font-bold uppercase text-green">{title}</h3>
      {players.length > 0 ? (
        <ul className="divide-y divide-border-light">
          {players.map((p, i) => (
            <li key={i} className="px-4 py-1.5 text-sm capitalize text-text-secondary">{p.toLowerCase()}</li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-3 text-xs text-text-muted">Escalação a definir.</p>
      )}
    </div>
  );
}

export function MunicipalGameView({ game }: { game: MunicipalGame }) {
  const id = ytId(game.youtubeUrl);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-text-muted">
        <Link href="/" className="hover:text-green">Início</Link>
        <span>/</span>
        <Link href="/sp/santana-de-parnaiba/municipal" className="hover:text-green">Municipal</Link>
        <span>/</span>
        <span className="text-text-secondary">{game.home} x {game.away}</span>
      </nav>

      {/* Placar / cabeçalho */}
      <div className="rounded-lg border border-border-custom bg-card-bg p-6">
        <div className="mb-4 flex items-center justify-center gap-2">
          {(game.division || game.roundLabel) && (
            <span className="text-[11px] font-bold uppercase tracking-wide text-green">
              {[game.division, game.roundLabel].filter(Boolean).join(" · ")}
            </span>
          )}
          <LiveBadge slug={game.slug} size="sm" />
        </div>
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          <TeamHead name={game.home} badge={game.homeBadge} />
          <div className="shrink-0 text-center">
            <div className="text-2xl font-extrabold tabular-nums text-text-primary">{game.time || "x"}</div>
            {game.date && <div className="text-[11px] text-text-muted">{game.date}</div>}
          </div>
          <TeamHead name={game.away} badge={game.awayBadge} />
        </div>
        {game.venue && <div className="mt-4 text-center text-xs text-text-muted">{game.venue}</div>}
      </div>

      {/* 3 colunas: escalação | vídeo + comentários | gols */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_260px]">
        {/* Esquerda: escalação */}
        <div className="order-2 space-y-4 lg:order-1">
          <Lineup title={game.home} players={game.homeLineup} />
          <Lineup title={game.away} players={game.awayLineup} />
        </div>

        {/* Meio: vídeo + lance a lance (textos/comentários) */}
        <div className="order-1 space-y-5 lg:order-2">
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
                <LiveBadge slug={game.slug} />
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
          <div className="rounded-lg border border-border-custom bg-card-bg">
            <h3 className="border-b border-border-custom px-4 py-2.5 text-xs font-bold uppercase text-green">Gols</h3>
            <p className="px-4 py-3 text-xs text-text-muted">Os gols aparecem aqui quando o jogo começar.</p>
          </div>
        </div>
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
