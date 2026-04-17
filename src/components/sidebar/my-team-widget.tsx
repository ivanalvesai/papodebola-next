"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, X, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useMyTeam } from "@/components/layout/my-team-context";
import { ALL_CLUSTER_TEAMS } from "@/lib/config";

export function MyTeamWidget() {
  const { myTeam, setMyTeam } = useMyTeam();
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");

  if (myTeam && !showPicker) {
    return (
      <div className="bg-card-bg rounded-lg border border-green/30 overflow-hidden">
        <div className="px-4 py-3 bg-green-light flex items-center justify-between">
          <span className="text-xs font-bold text-green uppercase flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 fill-green" />
            Meu Time
          </span>
          <button
            onClick={() => setShowPicker(true)}
            className="text-[10px] text-green hover:underline"
          >
            Trocar
          </button>
        </div>
        <Link
          href={`/futebol/times/${myTeam.slug}`}
          className="flex items-center gap-3 px-4 py-3 hover:bg-card-hover transition-colors"
        >
          <Image
            src={`/img/team/${myTeam.id}/image`}
            alt={myTeam.name}
            width={40}
            height={40}
            className="rounded-full"
            unoptimized
          />
          <div className="flex-1">
            <div className="text-sm font-bold text-text-primary">{myTeam.name}</div>
            <div className="text-[10px] text-text-muted">Ver pagina do time</div>
          </div>
          <ChevronRight className="h-4 w-4 text-text-muted" />
        </Link>
        <div className="px-4 pb-3 grid grid-cols-2 gap-1.5">
          <Link
            href={`/futebol/times/${myTeam.slug}/jogo-hoje`}
            className="text-[11px] text-center py-1.5 bg-body rounded text-text-secondary hover:text-green hover:bg-green-light transition-colors font-medium"
          >
            Jogo de Hoje
          </Link>
          <Link
            href={`/futebol/times/${myTeam.slug}/proximos-jogos`}
            className="text-[11px] text-center py-1.5 bg-body rounded text-text-secondary hover:text-green hover:bg-green-light transition-colors font-medium"
          >
            Proximos Jogos
          </Link>
          <Link
            href={`/futebol/times/${myTeam.slug}/estatisticas`}
            className="text-[11px] text-center py-1.5 bg-body rounded text-text-secondary hover:text-green hover:bg-green-light transition-colors font-medium"
          >
            Estatisticas
          </Link>
          <Link
            href={`/futebol/times/${myTeam.slug}/escalacao`}
            className="text-[11px] text-center py-1.5 bg-body rounded text-text-secondary hover:text-green hover:bg-green-light transition-colors font-medium"
          >
            Escalacao
          </Link>
        </div>
      </div>
    );
  }

  // Team picker
  const filtered = search
    ? ALL_CLUSTER_TEAMS.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
      )
    : ALL_CLUSTER_TEAMS;

  return (
    <div className="bg-card-bg rounded-lg border border-border-custom overflow-hidden">
      <div className="px-4 py-3 border-b border-border-custom flex items-center justify-between">
        <span className="text-xs font-bold text-text-primary uppercase flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5 text-green" />
          Escolha seu time
        </span>
        {showPicker && myTeam && (
          <button
            onClick={() => setShowPicker(false)}
            className="p-1 text-text-muted hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="px-4 py-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar time..."
          className="w-full h-8 rounded bg-input-bg px-3 text-sm text-text-primary placeholder:text-text-muted border border-border-custom focus:outline-none focus:ring-1 focus:ring-green"
        />
      </div>
      <div className="max-h-[280px] overflow-y-auto">
        {filtered.map((team) => (
          <button
            key={team.slug}
            onClick={() => {
              setMyTeam(team.slug);
              setShowPicker(false);
              setSearch("");
            }}
            className="flex items-center gap-2.5 w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-green hover:bg-green-light transition-colors"
          >
            <Image
              src={`/img/team/${team.id}/image`}
              alt=""
              width={22}
              height={22}
              className="rounded-full"
              unoptimized
            />
            {team.name}
          </button>
        ))}
      </div>
      {myTeam && (
        <div className="px-4 py-2 border-t border-border-custom">
          <button
            onClick={() => { setMyTeam(null); setShowPicker(false); }}
            className="text-[11px] text-red hover:underline"
          >
            Remover time favorito
          </button>
        </div>
      )}
    </div>
  );
}
