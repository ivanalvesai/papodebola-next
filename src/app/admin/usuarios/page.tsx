"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
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
              <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
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
            <div key={u.username} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1">
                <div className="text-sm font-semibold text-text-primary">{u.username}</div>
                <div className="text-xs text-text-muted">{u.role}</div>
              </div>
              {u.username !== "admin" && (
                <button onClick={() => handleDelete(u.username)} className="p-2 text-text-muted hover:text-red transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
