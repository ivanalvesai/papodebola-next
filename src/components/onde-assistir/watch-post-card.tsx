import Link from "next/link";
import type { WatchPost } from "@/lib/data/watch";

// Card de um post "onde assistir" fora da URL dele (hub, /ao-vivo, campeonato, jogo).
// Só título, capa e a linha do jogo; o clique leva à URL canônica (sem duplicar conteúdo).
const TZ = "America/Sao_Paulo";

export function watchWhen(ts: number): string {
  const d = new Date(ts * 1000);
  const day = d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: TZ });
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).replace(":", "h");
  return `${day.replace(".", "")} · ${time}`;
}

export function WatchPostCard({ post, compact = false }: { post: WatchPost; compact?: boolean }) {
  const { article, match } = post;
  const line = [match ? watchWhen(match.timestamp) : "", article.watch?.channels || ""].filter(Boolean).join(" · ");
  return (
    <Link
      href={article.url}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border-custom bg-card-bg transition-shadow hover:shadow-md"
    >
      {article.image && !compact && (
        <div className="aspect-[16/9] w-full overflow-hidden bg-body">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image}
            alt={article.rewrittenTitle}
            loading="lazy"
            width={800}
            height={450}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-3">
        <span className="text-xs font-bold uppercase tracking-wide text-green">Onde assistir</span>
        <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-text-primary group-hover:text-green">
          {article.rewrittenTitle}
        </h3>
        {line && <p className="mt-auto pt-2 text-sm text-text-secondary">{line}</p>}
      </div>
    </Link>
  );
}

export function WatchPostsStrip({
  posts,
  title,
  seeAll = true,
}: {
  posts: WatchPost[];
  title: string;
  seeAll?: boolean;
}) {
  if (!posts.length) return null;
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between border-b-2 border-green pb-2">
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
        {seeAll && (
          <Link href="/onde-assistir" className="text-sm font-semibold text-green hover:text-green-hover">
            Ver todos
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((p) => (
          <WatchPostCard key={p.article.slug} post={p} />
        ))}
      </div>
    </section>
  );
}
