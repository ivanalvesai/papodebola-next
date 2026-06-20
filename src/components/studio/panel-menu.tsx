"use client";

import { useState, useRef, useEffect } from "react";
import {
  LayoutGrid, FileText, Flame, LayoutTemplate, Users, Gamepad2,
  Bell, Settings, Rocket, Sparkles, Lightbulb, ChevronDown,
} from "lucide-react";

// Navegação compartilhada entre as telas "cheias" (Studio, Mural de Ideias) e o
// painel. Sem isso, dentro do Studio não dava pra trocar de aba (artigos, pautas…).
const ITEMS: { href: string; label: string; icon: React.ElementType }[] = [
  { href: "/studio-pdb", label: "Studio", icon: Sparkles },
  { href: "/studio-pdb/ideias", label: "Mural de Ideias", icon: Lightbulb },
  { href: "/painel-pdb-9x/artigos", label: "Artigos", icon: FileText },
  { href: "/painel-pdb-9x/pautas", label: "Pautas", icon: Flame },
  { href: "/painel-pdb-9x/paginas", label: "Páginas", icon: LayoutTemplate },
  { href: "/painel-pdb-9x/usuarios", label: "Usuarios", icon: Users },
  { href: "/painel-pdb-9x/jogos", label: "Jogos", icon: Gamepad2 },
  { href: "/painel-pdb-9x/notificacoes", label: "Notificações", icon: Bell },
  { href: "/painel-pdb-9x/config", label: "Config", icon: Settings },
  { href: "/painel-pdb-9x/promote", label: "Promover", icon: Rocket },
];

export function PanelMenu({ current }: { current?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onClick);
    return () => document.removeEventListener("pointerdown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 border border-border-custom text-text-secondary rounded-lg text-sm font-semibold hover:border-green hover:text-green transition-colors"
        title="Navegar no painel">
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Painel</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-surface border border-border-custom rounded-lg shadow-lg p-1 z-50 min-w-[200px]">
          {ITEMS.map((it) => {
            const active = current === it.href;
            return (
              <a key={it.href} href={it.href}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                  active ? "bg-green-light text-green font-semibold" : "text-text-secondary hover:text-green hover:bg-green-light"
                }`}>
                <it.icon className="h-4 w-4" /> {it.label}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
