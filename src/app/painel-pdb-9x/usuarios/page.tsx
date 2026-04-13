"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface User {
  username: string;
  role: string;
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "editor" });

  const [editingPass, setEditingPass] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<Record<string, string>>({});

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch { setUsers([]); }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (newUser.password.length < 6) { alert("Senha deve ter no minimo 6 caracteres"); return; }
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        setShowForm(false);
        setNewUser({ username: "", password: "", role: "editor" });
        loadUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Erro");
      }
    } catch { alert("Erro de conexao"); }
  }

  async function handleDelete(username: string) {
    if (!confirm(`Excluir usuario "${username}"?`)) return;
    try {
      await fetch(`/api/users/${username}`, { method: "DELETE" });
      loadUsers();
    } catch { alert("Erro"); }
  }

  async function handleChangePassword(username: string) {
    if (newPassword.length < 6) {
      setPassMsg({ ...passMsg, [username]: "Minimo 6 caracteres" });
      return;
    }
    setPassLoading(true);
    try {
      const res = await fetch(`/api/users/${username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        setPassMsg({ ...passMsg, [username]: "Senha alterada!" });
        setNewPassword("");
        setTimeout(() => {
          setEditingPass(null);
          setPassMsg((prev) => { const n = { ...prev }; delete n[username]; return n; });
        }, 2000);
      } else {
        setPassMsg({ ...passMsg, [username]: "Erro ao alterar" });
      }
    } catch {
      setPassMsg({ ...passMsg, [username]: "Erro de conexao" });
    }
    setPassLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-text-primary">Usuarios</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-green hover:bg-green-hover text-white gap-1.5">
          <Plus className="h-4 w-4" />
          Novo Usuario
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card-bg rounded-lg border border-border-custom p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Usuario</label>
              <Input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Senha</label>
              <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Minimo 6 caracteres" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Perfil</label>
              <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full h-9 rounded-md border border-border-custom bg-surface px-3 text-sm">
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-green hover:bg-green-hover text-white">Criar</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-text-muted" /></div>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border-custom divide-y divide-border-light">
          {users.map((u) => (
            <div key={u.username}>
              <div className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-text-primary">{u.username}</div>
                  <div className="text-xs text-text-muted">{u.role}</div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setEditingPass(editingPass === u.username ? null : u.username);
                      setNewPassword("");
                      setPassMsg({});
                    }}
                    className="p-2 text-text-muted hover:text-green transition-colors"
                    title="Alterar senha"
                  >
                    <Lock className="h-4 w-4" />
                  </button>
                  {u.username !== "admin" && (
                    <button onClick={() => handleDelete(u.username)} className="p-2 text-text-muted hover:text-red transition-colors" title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {editingPass === u.username && (
                <div className="px-4 pb-3 flex items-center gap-2">
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nova senha (min 6 caracteres)"
                    className="max-w-[250px] h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    disabled={passLoading}
                    onClick={() => handleChangePassword(u.username)}
                    className="bg-green hover:bg-green-hover text-white h-8 px-3"
                  >
                    {passLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  </Button>
                  {passMsg[u.username] && (
                    <span className={`text-xs font-semibold ${passMsg[u.username].includes("alterada") ? "text-green" : "text-red"}`}>
                      {passMsg[u.username]}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
