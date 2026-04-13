"use client";

import { Settings, RefreshCw, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AdminConfigPage() {
  const [revalidating, setRevalidating] = useState(false);
  const [cacheMsg, setCacheMsg] = useState("");

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState("");
  const [passError, setPassError] = useState("");

  async function handleRevalidate() {
    setRevalidating(true);
    setCacheMsg("");
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
      setCacheMsg(data.revalidated ? "Cache limpo com sucesso!" : "Erro ao limpar cache");
    } catch {
      setCacheMsg("Erro de conexao");
    }
    setRevalidating(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassMsg("");
    setPassError("");

    if (newPass.length < 6) {
      setPassError("A nova senha deve ter no minimo 6 caracteres");
      return;
    }
    if (newPass !== confirmPass) {
      setPassError("As senhas nao coincidem");
      return;
    }

    setPassLoading(true);
    try {
      // Verify current password by trying to login
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: currentPass }),
      });

      if (!loginRes.ok) {
        setPassError("Senha atual incorreta");
        setPassLoading(false);
        return;
      }

      // Update password
      const res = await fetch("/api/users/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPass }),
      });

      if (res.ok) {
        setPassMsg("Senha alterada com sucesso!");
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
      } else {
        const data = await res.json();
        setPassError(data.error || "Erro ao alterar senha");
      }
    } catch {
      setPassError("Erro de conexao");
    }
    setPassLoading(false);
  }

  return (
    <div>
      <h2 className="text-base font-bold text-text-primary mb-4">Configuracoes</h2>

      <div className="space-y-4">
        {/* Change password */}
        <div className="bg-card-bg rounded-lg border border-border-custom p-6">
          <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <Lock className="h-4 w-4 text-green" />
            Alterar Senha
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Senha atual
              </label>
              <Input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Nova senha
              </label>
              <Input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Minimo 6 caracteres"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Confirmar nova senha
              </label>
              <Input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                required
              />
            </div>
            {passError && <p className="text-sm text-red font-semibold">{passError}</p>}
            {passMsg && <p className="text-sm text-green font-semibold">{passMsg}</p>}
            <Button
              type="submit"
              disabled={passLoading}
              className="bg-green hover:bg-green-hover text-white gap-1.5"
            >
              {passLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Alterar Senha
            </Button>
          </form>
        </div>

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
          {cacheMsg && (
            <p className="text-sm mt-3 text-green font-semibold">{cacheMsg}</p>
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
