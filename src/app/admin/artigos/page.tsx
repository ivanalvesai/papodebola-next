"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Article } from "@/types/article";

export default function AdminArtigosPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadArticles();
  }, [page]);

  async function loadArticles() {
    setLoading(true);
    try {
      const res = await fetch(`/api/articles?page=${page}&limit=15`);
      const data = await res.json();
      setArticles(data.articles || []);
      setTotalPages(data.pages || 1);
    } catch {
      setArticles([]);
    }
    setLoading(false);
  }

  async function handleDelete(slug: string) {
    if (!confirm(`Excluir artigo "${slug}"?`)) return;
    try {
      await fetch(`/api/articles/${slug}`, { method: "DELETE" });
      loadArticles();
    } catch {
      alert("Erro ao excluir");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-text-primary">Artigos</h2>
        <Link href="/admin/artigos/novo">
          <Button className="bg-green hover:bg-green-hover text-white gap-1.5">
            <Plus className="h-4 w-4" />
            Novo Artigo
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border-custom p-8 text-center text-text-muted">
          Nenhum artigo encontrado
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border-custom divide-y divide-border-light">
          {articles.map((a) => (
            <div key={a.slug} className="flex items-center gap-4 px-4 py-3 hover:bg-card-hover">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary truncate">
                  {a.rewrittenTitle}
                </div>
                <div className="text-xs text-text-muted mt-0.5">
                  {a.category} | {new Date(a.pubDate).toLocaleDateString("pt-BR")} | {a.source}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Link
                  href={`/artigos/${a.slug}`}
                  target="_blank"
                  className="p-2 text-text-muted hover:text-green transition-colors"
                  title="Ver"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(a.slug)}
                  className="p-2 text-text-muted hover:text-red transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-text-muted">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Proxima
          </Button>
        </div>
      )}
    </div>
  );
}
