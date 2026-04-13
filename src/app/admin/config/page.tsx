"use client";

import { Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AdminConfigPage() {
  const [revalidating, setRevalidating] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRevalidate() {
    setRevalidating(true);
    setMessage("");
    try {
      const res = await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: "papodebola-revalidate-secret",
          paths: ["/", "/noticias", "/agenda"],
        }),
      });
      const data = await res.json();
      setMessage(data.revalidated ? "Cache limpo com sucesso!" : "Erro ao limpar cache");
    } catch {
      setMessage("Erro de conexao");
    }
    setRevalidating(false);
  }

  return (
    <div>
      <h2 className="text-base font-bold text-text-primary mb-4">Configuracoes</h2>

      <div className="space-y-4">
        {/* Cache */}
        <div className="bg-card-bg rounded-lg border border-border-custom p-6">
          <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-green" />
            Cache ISR
          </h3>
          <p className="text-sm text-text-muted mb-4">
            Forca a atualizacao do cache das paginas principais. Util apos publicar novos artigos.
          </p>
          <Button
            onClick={handleRevalidate}
            disabled={revalidating}
            className="bg-green hover:bg-green-hover text-white gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${revalidating ? "animate-spin" : ""}`} />
            Limpar Cache
          </Button>
          {message && (
            <p className="text-sm mt-3 text-green font-semibold">{message}</p>
          )}
        </div>

        {/* Info */}
        <div className="bg-card-bg rounded-lg border border-border-custom p-6">
          <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <Settings className="h-4 w-4 text-green" />
            Informacoes do Sistema
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-border-light">
              <span className="text-text-muted">Framework</span>
              <span className="font-semibold">Next.js 16</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-light">
              <span className="text-text-muted">CMS</span>
              <span className="font-semibold">WordPress (Headless)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-light">
              <span className="text-text-muted">API Principal</span>
              <span className="font-semibold">AllSportsApi (Pro)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-light">
              <span className="text-text-muted">API Calendario</span>
              <span className="font-semibold">CBF (Gratuita)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-muted">Auth</span>
              <span className="font-semibold">JWT (httpOnly cookie)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
