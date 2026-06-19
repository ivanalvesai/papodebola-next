"use client";

import { useState, useEffect, useCallback } from "react";
import { LayoutTemplate, Save, ExternalLink, Check, Loader2 } from "lucide-react";

type Fields = { h1?: string; metaTitle?: string; metaDescription?: string };

interface PageDef {
  route: string;
  label: string;
  // defaults do código (mostrados como placeholder; vazio = usa o default)
  defaults: { h1: string; metaTitle: string; metaDescription: string };
  h1Note?: string;
}

// Piloto: só a Página inicial. Pra adicionar outra página, é só incluir aqui +
// religar a página pra ler o override (helper getPageOverride).
const PAGES: PageDef[] = [
  {
    route: "/",
    label: "Página inicial",
    defaults: {
      h1: "Papo de Bola — Futebol brasileiro e mundial: notícias, jogos ao vivo e classificações",
      metaTitle: "Papo de Bola | Futebol e Esportes do Brasil e do Mundo",
      metaDescription:
        "Acompanhe notícias de futebol e esportes, jogos de hoje, resultados ao vivo, tabelas, classificações e as principais competições do mundo.",
    },
    h1Note: "H1 da home é invisível na tela (só pra SEO/leitores). Vale como título principal pro Google.",
  },
];

export default function PaginasPage() {
  const [draft, setDraft] = useState<Record<string, Fields>>({});
  const [loading, setLoading] = useState(true);
  const [savingRoute, setSavingRoute] = useState<string | null>(null);
  const [savedRoute, setSavedRoute] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/page-overrides", { cache: "no-store" });
      if (r.ok) setDraft(await r.json());
    } catch {
      /* ignora */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function setField(route: string, field: keyof Fields, value: string) {
    setDraft((prev) => ({ ...prev, [route]: { ...prev[route], [field]: value } }));
    setSavedRoute(null);
  }

  async function save(route: string) {
    setSavingRoute(route);
    try {
      const r = await fetch("/api/page-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ route, override: draft[route] || {} }),
      });
      if (r.ok) setSavedRoute(route);
      else alert("Erro ao salvar");
    } catch {
      alert("Erro de conexão");
    }
    setSavingRoute(null);
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary">
          <LayoutTemplate className="h-5 w-5 text-green" />
          Páginas — textos e SEO
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Edite o H1, o título e a descrição (meta) de cada página, sem mexer no código. Deixe um
          campo <strong>vazio</strong> pra usar o texto padrão. Ao salvar, a mudança vai pro ar em
          segundos (a página é revalidada automaticamente).
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      ) : (
        <div className="space-y-5">
          {PAGES.map((p) => {
            const f = draft[p.route] || {};
            const desc = f.metaDescription ?? "";
            return (
              <div key={p.route} className="rounded-lg border border-border-custom bg-card-bg p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{p.label}</h3>
                    <code className="text-[11px] text-text-muted">{p.route}</code>
                  </div>
                  <a
                    href={p.route}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-green hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Ver página
                  </a>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-text-secondary">
                      H1 (título principal)
                    </label>
                    <input
                      value={f.h1 ?? ""}
                      onChange={(e) => setField(p.route, "h1", e.target.value)}
                      placeholder={p.defaults.h1}
                      className="w-full rounded-lg border border-border-custom bg-surface px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-2 focus:ring-green/30"
                    />
                    {p.h1Note && <p className="mt-1 text-[11px] text-text-muted">{p.h1Note}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-text-secondary">
                      Meta title (título no Google / aba)
                    </label>
                    <input
                      value={f.metaTitle ?? ""}
                      onChange={(e) => setField(p.route, "metaTitle", e.target.value)}
                      placeholder={p.defaults.metaTitle}
                      className="w-full rounded-lg border border-border-custom bg-surface px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-2 focus:ring-green/30"
                    />
                    <p className="mt-1 text-[11px] text-text-muted">
                      {(f.metaTitle || "").length || 0} caracteres (ideal até 60)
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-text-secondary">
                      Meta description (descrição no Google)
                    </label>
                    <textarea
                      value={desc}
                      onChange={(e) => setField(p.route, "metaDescription", e.target.value)}
                      placeholder={p.defaults.metaDescription}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-border-custom bg-surface px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-2 focus:ring-green/30"
                    />
                    <p className="mt-1 text-[11px] text-text-muted">
                      {desc.length} caracteres (ideal 120–155)
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => save(p.route)}
                    disabled={savingRoute === p.route}
                    className="inline-flex items-center gap-2 rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-hover disabled:opacity-50"
                  >
                    {savingRoute === p.route ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salvar
                  </button>
                  {savedRoute === p.route && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green">
                      <Check className="h-4 w-4" /> Salvo! Já está no ar.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
