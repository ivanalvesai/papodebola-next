"use client";

import { useState, useEffect, useCallback } from "react";
import { LayoutTemplate, Save, ExternalLink, Check, Loader2 } from "lucide-react";
import { editableByPage } from "@/lib/data/editable-content";

const PAGES = editableByPage();

export default function PaginasPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingPage, setSavingPage] = useState<string | null>(null);
  const [savedPage, setSavedPage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/page-overrides", { cache: "no-store" });
      if (r.ok) setValues(await r.json());
    } catch {
      /* ignora */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function setField(id: string, v: string) {
    setValues((prev) => ({ ...prev, [id]: v }));
    setSavedPage(null);
  }

  async function savePage(page: string, ids: string[]) {
    setSavingPage(page);
    const updates: Record<string, string> = {};
    for (const id of ids) updates[id] = values[id] ?? "";
    try {
      const r = await fetch("/api/page-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (r.ok) setSavedPage(page);
      else alert("Erro ao salvar");
    } catch {
      alert("Erro de conexão");
    }
    setSavingPage(null);
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary">
          <LayoutTemplate className="h-5 w-5 text-green" />
          Páginas — textos e SEO
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Edite qualquer texto das páginas abaixo, sem mexer no código. Deixe um campo{" "}
          <strong>vazio</strong> pra usar o texto padrão (mostrado em cinza). Ao salvar, a mudança
          vai pro ar em segundos.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      ) : (
        <div className="space-y-6">
          {PAGES.map((pg) => {
            const ids = pg.items.map((i) => i.id);
            // agrupa por seção preservando ordem
            const sections: { name: string; items: typeof pg.items }[] = [];
            for (const it of pg.items) {
              let s = sections.find((x) => x.name === it.def.section);
              if (!s) sections.push((s = { name: it.def.section, items: [] }));
              s.items.push(it);
            }
            return (
              <div key={pg.page} className="rounded-lg border border-border-custom bg-card-bg p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-text-primary">{pg.pageLabel}</h3>
                    <code className="text-[11px] text-text-muted">{pg.page}</code>
                  </div>
                  <a
                    href={pg.page}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-green hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Ver página
                  </a>
                </div>

                <div className="space-y-5">
                  {sections.map((sec) => (
                    <div key={sec.name}>
                      <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-text-muted">
                        {sec.name}
                      </div>
                      <div className="space-y-3">
                        {sec.items.map(({ id, def }) => {
                          const val = values[id] ?? "";
                          return (
                            <div key={id}>
                              <label className="mb-1 block text-xs font-semibold text-text-secondary">
                                {def.label}
                              </label>
                              {def.type === "multiline" ? (
                                <textarea
                                  value={val}
                                  onChange={(e) => setField(id, e.target.value)}
                                  placeholder={def.default}
                                  rows={3}
                                  className="w-full resize-none rounded-lg border border-border-custom bg-surface px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-2 focus:ring-green/30"
                                />
                              ) : (
                                <input
                                  value={val}
                                  onChange={(e) => setField(id, e.target.value)}
                                  placeholder={def.default}
                                  className="w-full rounded-lg border border-border-custom bg-surface px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-2 focus:ring-green/30"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => savePage(pg.page, ids)}
                    disabled={savingPage === pg.page}
                    className="inline-flex items-center gap-2 rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-hover disabled:opacity-50"
                  >
                    {savingPage === pg.page ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salvar {pg.pageLabel}
                  </button>
                  {savedPage === pg.page && (
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
