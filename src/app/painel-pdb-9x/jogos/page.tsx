"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2, Loader2, Shield, Trophy, Gamepad2, Upload, Play, Square, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CustomTeam { id: string; name: string; shortName: string; badge: string; }
interface CustomLeague { id: string; name: string; }
interface CustomGame {
  id: string; leagueId: string; leagueName: string;
  homeTeamId: string; homeTeamName: string; homeBadge: string;
  awayTeamId: string; awayTeamName: string; awayBadge: string;
  date: string; time: string; status: "scheduled" | "live" | "finished";
  homeScore: number; awayScore: number; featured: boolean;
  embeds: { name: string; url: string }[];
}

type Tab = "teams" | "leagues" | "games";

export default function AdminJogosPage() {
  const [tab, setTab] = useState<Tab>("games");
  const [teams, setTeams] = useState<CustomTeam[]>([]);
  const [leagues, setLeagues] = useState<CustomLeague[]>([]);
  const [games, setGames] = useState<CustomGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [t, l, g] = await Promise.all([
      fetch("/api/custom-teams").then(r => r.json()).catch(() => ({ teams: [] })),
      fetch("/api/custom-leagues").then(r => r.json()).catch(() => ({ leagues: [] })),
      fetch("/api/custom-games").then(r => r.json()).catch(() => ({ games: [] })),
    ]);
    setTeams(t.teams || []);
    setLeagues(l.leagues || []);
    setGames(g.games || []);
    setLoading(false);
  }

  const tabs = [
    { key: "games" as Tab, label: "Jogos", icon: Gamepad2, count: games.length },
    { key: "teams" as Tab, label: "Times", icon: Shield, count: teams.length },
    { key: "leagues" as Tab, label: "Campeonatos", icon: Trophy, count: leagues.length },
  ];

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-text-muted" /></div>;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-green text-white" : "bg-body text-text-secondary hover:text-green"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === "teams" && <TeamsSection teams={teams} onRefresh={loadAll} />}
      {tab === "leagues" && <LeaguesSection leagues={leagues} onRefresh={loadAll} />}
      {tab === "games" && <GamesSection games={games} teams={teams} leagues={leagues} onRefresh={loadAll} />}
    </div>
  );
}

// ==================== TEAMS ====================

function TeamsSection({ teams, onRefresh }: { teams: CustomTeam[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [badgeFile, setBadgeFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setSaving(true);

    let badgeData = "";
    let badgeFilename = "";
    if (badgeFile) {
      const buffer = await badgeFile.arrayBuffer();
      badgeData = Buffer.from(buffer).toString("base64");
      badgeFilename = badgeFile.name;
    }

    await fetch("/api/custom-teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, shortName, badgeData, badgeFilename }),
    });

    setName(""); setShortName(""); setBadgeFile(null); setShowForm(false);
    setSaving(false);
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este time?")) return;
    await fetch("/api/custom-teams", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    onRefresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-text-primary">Times Customizados</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-green hover:bg-green-hover text-white gap-1">
          <Plus className="h-3.5 w-3.5" /> Novo Time
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card-bg rounded-lg border border-border-custom p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Nome completo *</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Amigos FC" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Nome curto</label>
              <Input value={shortName} onChange={e => setShortName(e.target.value)} placeholder="Ex: AFC" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Escudo <span className="font-normal text-text-muted">(PNG ou JPG, 100x100px, max 200KB)</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-body border border-border-custom rounded-lg text-sm text-text-secondary cursor-pointer hover:border-green hover:text-green transition-colors">
                <Upload className="h-3.5 w-3.5" />
                {badgeFile ? badgeFile.name : "Escolher arquivo"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={e => setBadgeFile(e.target.files?.[0] || null)}
                />
              </label>
              {badgeFile && (
                <button type="button" onClick={() => setBadgeFile(null)} className="text-text-muted hover:text-red">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-text-muted mt-1">
              Formato: PNG ou JPG | Tamanho ideal: 100x100 pixels | Fundo transparente (PNG) recomendado | Max: 200KB
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="bg-green hover:bg-green-hover text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Time"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {teams.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border-custom p-8 text-center text-text-muted text-sm">
          Nenhum time customizado cadastrado
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border-custom divide-y divide-border-light">
          {teams.map(t => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-2.5">
              {t.badge ? (
                <Image src={t.badge} alt="" width={32} height={32} className="rounded-full" unoptimized />
              ) : (
                <div className="w-8 h-8 rounded-full bg-body flex items-center justify-center text-text-muted"><Shield className="h-4 w-4" /></div>
              )}
              <div className="flex-1">
                <div className="text-sm font-semibold text-text-primary">{t.name}</div>
                <div className="text-[10px] text-text-muted">{t.shortName}</div>
              </div>
              <button onClick={() => handleDelete(t.id)} className="p-2 text-text-muted hover:text-red"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== LEAGUES ====================

function LeaguesSection({ leagues, onRefresh }: { leagues: CustomLeague[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    await fetch("/api/custom-leagues", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    setName(""); setShowForm(false);
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este campeonato?")) return;
    await fetch("/api/custom-leagues", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    onRefresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-text-primary">Campeonatos Customizados</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-green hover:bg-green-hover text-white gap-1">
          <Plus className="h-3.5 w-3.5" /> Novo Campeonato
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card-bg rounded-lg border border-border-custom p-4 mb-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-text-secondary mb-1">Nome do campeonato *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Copa da Varzea 2026" required />
          </div>
          <Button type="submit" className="bg-green hover:bg-green-hover text-white">Criar</Button>
          <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
        </form>
      )}

      {leagues.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border-custom p-8 text-center text-text-muted text-sm">
          Nenhum campeonato customizado cadastrado
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border-custom divide-y divide-border-light">
          {leagues.map(l => (
            <div key={l.id} className="flex items-center gap-3 px-4 py-2.5">
              <Trophy className="h-4 w-4 text-green shrink-0" />
              <span className="text-sm font-semibold text-text-primary flex-1">{l.name}</span>
              <button onClick={() => handleDelete(l.id)} className="p-2 text-text-muted hover:text-red"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== GAMES ====================

function GamesSection({ games, teams, leagues, onRefresh }: { games: CustomGame[]; teams: CustomTeam[]; leagues: CustomLeague[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    leagueId: "", homeTeamId: "", awayTeamId: "",
    date: "", time: "", status: "scheduled" as CustomGame["status"],
    homeScore: 0, awayScore: 0, featured: false,
    embedName: "", embedUrl: "",
  });

  function getTeam(id: string) { return teams.find(t => t.id === id); }
  function getLeague(id: string) { return leagues.find(l => l.id === id); }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const home = getTeam(form.homeTeamId);
    const away = getTeam(form.awayTeamId);
    const league = getLeague(form.leagueId);
    if (!home || !away || !league) { alert("Selecione campeonato e os dois times"); return; }

    const embeds = form.embedUrl ? [{ name: form.embedName || "Opcao 1", url: form.embedUrl }] : [];

    await fetch("/api/custom-games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leagueId: league.id, leagueName: league.name,
        homeTeamId: home.id, homeTeamName: home.name, homeBadge: home.badge,
        awayTeamId: away.id, awayTeamName: away.name, awayBadge: away.badge,
        date: form.date, time: form.time, status: form.status,
        homeScore: form.homeScore, awayScore: form.awayScore,
        featured: form.featured, embeds,
      }),
    });

    setForm({ leagueId: "", homeTeamId: "", awayTeamId: "", date: "", time: "", status: "scheduled", homeScore: 0, awayScore: 0, featured: false, embedName: "", embedUrl: "" });
    setShowForm(false);
    onRefresh();
  }

  async function toggleStatus(game: CustomGame) {
    const next = game.status === "scheduled" ? "live" : game.status === "live" ? "finished" : "scheduled";
    await fetch("/api/custom-games", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: game.id, status: next }) });
    onRefresh();
  }

  async function updateScore(game: CustomGame, field: "homeScore" | "awayScore", value: number) {
    await fetch("/api/custom-games", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: game.id, [field]: value }) });
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este jogo?")) return;
    await fetch("/api/custom-games", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    onRefresh();
  }

  const statusIcon = { scheduled: Square, live: Play, finished: CheckCircle };
  const statusLabel = { scheduled: "Agendado", live: "Ao Vivo", finished: "Encerrado" };
  const statusColor = { scheduled: "text-text-muted", live: "text-red", finished: "text-green" };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-text-primary">Jogos</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-green hover:bg-green-hover text-white gap-1">
          <Plus className="h-3.5 w-3.5" /> Novo Jogo
        </Button>
      </div>

      {teams.length === 0 || leagues.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-orange/30 p-4 mb-4 text-sm text-orange">
          Cadastre pelo menos 1 campeonato e 2 times antes de criar jogos.
        </div>
      ) : null}

      {showForm && teams.length >= 2 && leagues.length >= 1 && (
        <form onSubmit={handleCreate} className="bg-card-bg rounded-lg border border-border-custom p-4 mb-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Campeonato *</label>
            <select value={form.leagueId} onChange={e => setForm({ ...form, leagueId: e.target.value })} className="w-full h-9 rounded-md border border-border-custom bg-surface px-3 text-sm" required>
              <option value="">Selecione...</option>
              {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Time da Casa *</label>
              <select value={form.homeTeamId} onChange={e => setForm({ ...form, homeTeamId: e.target.value })} className="w-full h-9 rounded-md border border-border-custom bg-surface px-3 text-sm" required>
                <option value="">Selecione...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Time Visitante *</label>
              <select value={form.awayTeamId} onChange={e => setForm({ ...form, awayTeamId: e.target.value })} className="w-full h-9 rounded-md border border-border-custom bg-surface px-3 text-sm" required>
                <option value="">Selecione...</option>
                {teams.filter(t => t.id !== form.homeTeamId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Data *</label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Horario *</label>
              <Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as CustomGame["status"] })} className="w-full h-9 rounded-md border border-border-custom bg-surface px-3 text-sm">
                <option value="scheduled">Agendado</option>
                <option value="live">Ao Vivo</option>
                <option value="finished">Encerrado</option>
              </select>
            </div>
          </div>
          {form.status !== "scheduled" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Placar Casa</label>
                <Input type="number" min={0} value={form.homeScore} onChange={e => setForm({ ...form, homeScore: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Placar Visitante</label>
                <Input type="number" min={0} value={form.awayScore} onChange={e => setForm({ ...form, awayScore: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Link de transmissao (opcional)</label>
            <div className="grid grid-cols-2 gap-2">
              <Input value={form.embedName} onChange={e => setForm({ ...form, embedName: e.target.value })} placeholder="Nome (ex: HD)" />
              <Input value={form.embedUrl} onChange={e => setForm({ ...form, embedUrl: e.target.value })} placeholder="URL do embed" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-green hover:bg-green-hover text-white">Criar Jogo</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {games.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border-custom p-8 text-center text-text-muted text-sm">
          Nenhum jogo cadastrado
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border-custom divide-y divide-border-light">
          {games.sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)).map(g => {
            const StatusIcon = statusIcon[g.status];
            return (
              <div key={g.id} className="px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-green uppercase">{g.leagueName}</span>
                  <span className="text-[10px] text-text-muted">{g.date} {g.time}</span>
                  <button onClick={() => toggleStatus(g)} className={`ml-auto flex items-center gap-1 text-[10px] font-bold ${statusColor[g.status]}`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusLabel[g.status]}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    {g.homeBadge && <Image src={g.homeBadge} alt="" width={24} height={24} className="rounded-full" unoptimized />}
                    <span className="text-sm font-semibold">{g.homeTeamName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input type="number" min={0} value={g.homeScore} onChange={e => updateScore(g, "homeScore", parseInt(e.target.value) || 0)} className="w-10 h-7 text-center text-sm font-bold border border-border-custom rounded bg-surface" />
                    <span className="text-text-muted text-xs">x</span>
                    <input type="number" min={0} value={g.awayScore} onChange={e => updateScore(g, "awayScore", parseInt(e.target.value) || 0)} className="w-10 h-7 text-center text-sm font-bold border border-border-custom rounded bg-surface" />
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="text-sm font-semibold">{g.awayTeamName}</span>
                    {g.awayBadge && <Image src={g.awayBadge} alt="" width={24} height={24} className="rounded-full" unoptimized />}
                  </div>
                  <button onClick={() => handleDelete(g.id)} className="p-1.5 text-text-muted hover:text-red ml-2"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
