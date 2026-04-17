"use client";

import Link from "next/link";
import Image from "next/image";
import { X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useSidePanel } from "./side-panel-context";
import { PANEL_TEAMS_BR, PANEL_TEAMS_EU, type TeamInfo } from "@/lib/config";

function TeamItem({ team }: { team: TeamInfo }) {
  return (
    <Link
      href={`/futebol/times/${team.slug}`}
      className="flex items-center gap-3 px-5 py-2.5 text-sm text-text-secondary hover:bg-green-light hover:text-green transition-colors"
    >
      <Image
        src={`/img/team/${team.id}/image`}
        alt={team.name}
        width={24}
        height={24}
        className="rounded-full"
        unoptimized
      />
      {team.name}
    </Link>
  );
}

function CollapsibleSection({
  title,
  teams,
  defaultOpen = true,
  searchQuery,
}: {
  title: string;
  teams: TeamInfo[];
  defaultOpen?: boolean;
  searchQuery: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const filtered = searchQuery
    ? teams.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : teams;

  if (searchQuery && filtered.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-2.5 text-xs font-bold text-text-primary uppercase tracking-wider bg-body hover:bg-border-light transition-colors"
      >
        {title}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && (
        <div>
          {filtered.map((team) => (
            <TeamItem key={team.slug} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SidePanel() {
  const { open, close } = useSidePanel();
  const [search, setSearch] = useState("");

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={close}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-[300px] bg-surface z-50 shadow-lg overflow-y-auto transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-custom">
          <h3 className="text-base font-bold text-text-primary">Menu</h3>
          <button
            onClick={close}
            className="p-1 rounded hover:bg-body transition-colors"
          >
            <X className="h-5 w-5 text-text-muted" />
          </button>
        </div>

        {/* Quick links */}
        <div className="border-b border-border-custom">
          <Link href="/" onClick={close} className="block px-5 py-2.5 text-sm font-semibold text-text-primary hover:bg-green-light hover:text-green transition-colors">
            Início
          </Link>
          <Link href="/noticias" onClick={close} className="block px-5 py-2.5 text-sm font-semibold text-text-primary hover:bg-green-light hover:text-green transition-colors">
            Notícias
          </Link>
          <Link href="/agenda" onClick={close} className="block px-5 py-2.5 text-sm font-semibold text-text-primary hover:bg-green-light hover:text-green transition-colors">
            Agenda
          </Link>
        </div>

        {/* Futebol */}
        <div className="border-b border-border-custom">
          <div className="px-5 py-2.5 text-xs font-bold text-text-primary uppercase tracking-wider bg-body">
            Futebol
          </div>
          <Link href="/futebol/jogos-hoje" onClick={close} className="block px-5 py-2.5 text-sm text-text-secondary hover:bg-green-light hover:text-green transition-colors">
            Jogos de Hoje
          </Link>
          <Link href="/futebol/onde-assistir" onClick={close} className="block px-5 py-2.5 text-sm text-text-secondary hover:bg-green-light hover:text-green transition-colors">
            Onde Assistir
          </Link>
          <Link href="/futebol/brasileirao-serie-a" onClick={close} className="block px-5 py-2.5 text-sm text-text-secondary hover:bg-green-light hover:text-green transition-colors">
            Brasileirão
          </Link>
          <Link href="/futebol/champions-league" onClick={close} className="block px-5 py-2.5 text-sm text-text-secondary hover:bg-green-light hover:text-green transition-colors">
            Champions League
          </Link>
          <Link href="/futebol/libertadores" onClick={close} className="block px-5 py-2.5 text-sm text-text-secondary hover:bg-green-light hover:text-green transition-colors">
            Libertadores
          </Link>
          <Link href="/futebol/selecao-brasileira" onClick={close} className="block px-5 py-2.5 text-sm text-text-secondary hover:bg-green-light hover:text-green transition-colors">
            Seleção Brasileira
          </Link>
          <Link href="/noticias?cat=Copa%20do%20Mundo" onClick={close} className="block px-5 py-2.5 text-sm text-text-secondary hover:bg-green-light hover:text-green transition-colors">
            Copa do Mundo 2026
          </Link>
        </div>

        {/* Sports */}
        <div className="border-b border-border-custom">
          <div className="px-5 py-2.5 text-xs font-bold text-text-primary uppercase tracking-wider bg-body">
            Esportes
          </div>
          <Link href="/basquete" onClick={close} className="block px-5 py-2.5 text-sm text-text-secondary hover:bg-green-light hover:text-green transition-colors">
            Basquete
          </Link>
          <Link href="/boxe" onClick={close} className="block px-5 py-2.5 text-sm text-text-secondary hover:bg-green-light hover:text-green transition-colors">
            Boxe
          </Link>
          <Link href="/combate" onClick={close} className="block px-5 py-2.5 text-sm text-text-secondary hover:bg-green-light hover:text-green transition-colors">
            Combate
          </Link>
          <Link href="/esports" onClick={close} className="block px-5 py-2.5 text-sm text-text-secondary hover:bg-green-light hover:text-green transition-colors">
            eSports
          </Link>
          <Link href="/formula-1" onClick={close} className="block px-5 py-2.5 text-sm text-text-secondary hover:bg-green-light hover:text-green transition-colors">
            Fórmula 1
          </Link>
          <Link href="/futebol-americano" onClick={close} className="block px-5 py-2.5 text-sm text-text-secondary hover:bg-green-light hover:text-green transition-colors">
            Futebol Americano
          </Link>
          <Link href="/futsal" onClick={close} className="block px-5 py-2.5 text-sm text-text-secondary hover:bg-green-light hover:text-green transition-colors">
            Futsal
          </Link>
          <Link href="/tenis" onClick={close} className="block px-5 py-2.5 text-sm text-text-secondary hover:bg-green-light hover:text-green transition-colors">
            Tênis
          </Link>
          <Link href="/volei" onClick={close} className="block px-5 py-2.5 text-sm text-text-secondary hover:bg-green-light hover:text-green transition-colors">
            Vôlei
          </Link>
        </div>

        {/* Meu Time */}
        <div className="border-b border-border-custom">
          <div className="px-5 py-2.5 text-xs font-bold text-text-primary uppercase tracking-wider bg-body">
            Meu Time
          </div>
          <div className="px-5 py-2">
            <input
              type="text"
              placeholder="Buscar time..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 rounded bg-input-bg px-3 text-sm text-text-primary placeholder:text-text-muted border border-border-custom focus:outline-none focus:ring-1 focus:ring-green"
            />
          </div>
        </div>

        {/* Teams */}
        <CollapsibleSection
          title="Brasileirão Série A"
          teams={PANEL_TEAMS_BR}
          searchQuery={search}
        />
        <CollapsibleSection
          title="Europa"
          teams={PANEL_TEAMS_EU}
          defaultOpen={false}
          searchQuery={search}
        />

        {/* Parceiros (último item) */}
        <div className="border-t border-border-custom">
          <Link
            href="/parceiros"
            onClick={close}
            className="block px-5 py-2.5 text-sm font-semibold text-text-primary hover:bg-green-light hover:text-green transition-colors"
          >
            Parceiros
          </Link>
        </div>
      </div>
    </>
  );
}
