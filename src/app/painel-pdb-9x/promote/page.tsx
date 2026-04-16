"use client";

import { useEffect, useState } from "react";
import { Rocket, AlertTriangle, CheckCircle2, RefreshCw, Loader2 } from "lucide-react";

type Commit = { sha: string; author: string; date: string; message: string };
type FileChange = { status: string; file: string };
type Preview = { ahead: number; behind: number; commits: Commit[]; files: FileChange[] };

export default function PromotePage() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; stdout: string; stderr: string } | null>(null);

  async function loadPreview() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/promote");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao carregar preview");
      } else {
        setPreview(data);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPreview();
  }, []);

  async function handlePromote() {
    setPromoting(true);
    setResult(null);
    try {
      const res = await fetch("/api/promote", { method: "POST" });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setTimeout(() => loadPreview(), 2000);
      }
    } catch (e) {
      setResult({ success: false, stdout: "", stderr: String(e) });
    } finally {
      setPromoting(false);
      setConfirming(false);
    }
  }

  const statusLabel: Record<string, string> = { A: "Adicionado", M: "Modificado", D: "Removido", R: "Renomeado" };
  const statusColor: Record<string, string> = { A: "text-green", M: "text-yellow-600", D: "text-red", R: "text-blue-600" };

  return (
    <div className="space-y-6 max-w-[1000px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Rocket className="h-5 w-5 text-green" />
            Promover para Producao
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Envia as mudancas validadas em <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">development</span> para o site <span className="font-semibold">papodebola.com.br</span>
          </p>
        </div>
        <button onClick={loadPreview} disabled={loading} className="text-sm text-text-muted hover:text-text-primary flex items-center gap-1.5">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="bg-red/10 border border-red text-red rounded-lg p-4 text-sm">
          <div className="font-semibold flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4" /> Erro</div>
          <div>{error}</div>
        </div>
      )}

      {loading && !preview && (
        <div className="bg-card-bg border border-border-custom rounded-lg p-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-text-muted" />
          <p className="text-sm text-text-muted mt-2">Verificando diferencas...</p>
        </div>
      )}

      {preview && preview.ahead === 0 && (
        <div className="bg-card-bg border border-border-custom rounded-lg p-8 text-center">
          <CheckCircle2 className="h-10 w-10 mx-auto text-green" />
          <p className="text-base font-semibold mt-3">Nada a promover</p>
          <p className="text-sm text-text-muted mt-1">Development e producao estao sincronizados.</p>
        </div>
      )}

      {preview && preview.ahead > 0 && (
        <>
          <div className="bg-card-bg border border-border-custom rounded-lg overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-border-custom flex items-center justify-between">
              <div className="text-sm font-semibold text-text-primary">
                {preview.ahead} commit(s) a promover
              </div>
              {preview.behind > 0 && (
                <div className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                  AVISO: master tem {preview.behind} commit(s) que development nao tem
                </div>
              )}
            </div>
            <ul className="divide-y divide-border-custom">
              {preview.commits.map((c) => (
                <li key={c.sha} className="px-5 py-3">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs text-text-muted mt-0.5 shrink-0">{c.sha}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-text-primary truncate">{c.message}</div>
                      <div className="text-xs text-text-muted mt-0.5">{c.author} - {c.date}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card-bg border border-border-custom rounded-lg overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-border-custom text-sm font-semibold">
              {preview.files.length} arquivo(s) alterado(s)
            </div>
            <ul className="divide-y divide-border-custom max-h-[300px] overflow-y-auto">
              {preview.files.map((f) => (
                <li key={f.file} className="px-5 py-2 flex items-center gap-3 text-sm font-mono">
                  <span className={`font-bold text-xs w-4 ${statusColor[f.status] || "text-text-muted"}`}>{f.status}</span>
                  <span className="text-text-muted text-xs">{statusLabel[f.status] || f.status}</span>
                  <span className="text-text-primary truncate">{f.file}</span>
                </li>
              ))}
            </ul>
          </div>

          {!confirming && !result && (
            <button
              onClick={() => setConfirming(true)}
              className="w-full bg-green hover:bg-green-hover text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Rocket className="h-4 w-4" />
              Promover para producao
            </button>
          )}

          {confirming && !result && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-text-primary">Confirmar promocao</p>
                  <p className="text-sm text-text-muted mt-1">
                    Esses {preview.ahead} commit(s) serao mergeados em <span className="font-mono">master</span> e publicados em <span className="font-semibold">papodebola.com.br</span>. O processo leva ~3 minutos.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handlePromote}
                      disabled={promoting}
                      className="bg-green hover:bg-green-hover disabled:opacity-50 text-white font-semibold px-4 py-2 rounded text-sm flex items-center gap-2"
                    >
                      {promoting ? <><Loader2 className="h-4 w-4 animate-spin" /> Promovendo...</> : <>Confirmar e promover</>}
                    </button>
                    <button
                      onClick={() => setConfirming(false)}
                      disabled={promoting}
                      className="bg-white border border-border-custom text-text-primary px-4 py-2 rounded text-sm disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {result && (
        <div className={`border rounded-lg p-4 ${result.success ? "bg-green/5 border-green" : "bg-red/5 border-red"}`}>
          <div className="flex items-center gap-2 font-semibold mb-2">
            {result.success ? (
              <><CheckCircle2 className="h-5 w-5 text-green" /> <span className="text-green">Promocao concluida</span></>
            ) : (
              <><AlertTriangle className="h-5 w-5 text-red" /> <span className="text-red">Falha na promocao</span></>
            )}
          </div>
          {result.success && (
            <p className="text-sm text-text-muted mb-2">Lembre de purgar o cache Cloudflare (Purge Everything).</p>
          )}
          <details className="text-xs">
            <summary className="cursor-pointer text-text-muted hover:text-text-primary">Ver log</summary>
            <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded overflow-x-auto max-h-[400px]">{result.stdout}{result.stderr && `\n\n--- stderr ---\n${result.stderr}`}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
