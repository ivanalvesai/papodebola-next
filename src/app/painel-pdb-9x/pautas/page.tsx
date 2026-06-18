import Link from "next/link";
import { Flame, ExternalLink, PenLine } from "lucide-react";
import { getHotNews } from "@/lib/data/hot-news-store";

// Sempre lê fresco o histórico rolante (volume compartilhado, alimentado pelo
// scan a cada 30min no dev).
export const dynamic = "force-dynamic";

function fmt(iso: string): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (!t) return "";
  return new Date(t).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

export default async function PautasPage() {
  const topics = await getHotNews();

  return (
    <div>
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary">
          <Flame className="h-5 w-5 text-green" />
          Notícias quentes do futebol
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Assuntos em alta no Brasil e no mundo, descobertos automaticamente a cada 30 min
          (Google Notícias). O histórico dura 2 dias e some sozinho. Isto só <strong>sugere
          pauta</strong> — nada é publicado automaticamente. Quanto mais fontes cobrindo, mais
          quente o assunto.
        </p>
      </div>

      {topics.length === 0 ? (
        <div className="rounded-lg border border-border-custom bg-card-bg p-8 text-center text-sm text-text-muted">
          Nenhum assunto no momento. O scan roda a cada 30 minutos e preenche esta lista.
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((t) => (
            <div key={t.key} className="rounded-lg border border-border-custom bg-card-bg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green/10 px-2 py-0.5 text-[11px] font-bold text-green">
                      <Flame className="h-3 w-3" />
                      {t.count} {t.count === 1 ? "fonte" : "fontes"}
                    </span>
                    <span className="text-[11px] text-text-muted">{fmt(t.latest)}</span>
                  </div>
                  <h3 className="text-sm font-semibold leading-snug text-text-primary">{t.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    {t.items.slice(0, 6).map((it, i) => (
                      <a
                        key={i}
                        href={it.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-[11px] text-text-muted hover:text-green"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {it.source}
                      </a>
                    ))}
                  </div>
                </div>
                <Link
                  href={`/studio-pdb?titulo=${encodeURIComponent(t.title)}`}
                  target="_blank"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-green px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-green/90"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  Escrever no Studio
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
