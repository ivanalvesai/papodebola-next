"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSidePanel } from "./side-panel-context";
import { PANEL_TEAMS_BR, SPORTS } from "@/lib/config";

export function MainNav() {
  const pathname = usePathname();
  const { toggle } = useSidePanel();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleDropdown(label: string) {
    setOpenDropdown(openDropdown === label ? null : label);
  }

  return (
    <nav
      ref={navRef}
      className="bg-nav-bg border-b border-border-custom shadow-sm sticky top-14 z-40"
    >
      <div className="mx-auto max-w-[1240px] px-4">
        <ul className="flex items-center gap-0 text-sm">
          {/* Menu lateral */}
          <li>
            <button
              onClick={toggle}
              className="flex items-center gap-1.5 px-3 py-3 text-text-secondary hover:text-green font-semibold transition-colors whitespace-nowrap"
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
          </li>


          {/* ========== TIMES ========== */}
          <li className="relative">
            <button
              onClick={() => toggleDropdown("times")}
              className={`flex items-center gap-1 px-3 py-3 font-semibold whitespace-nowrap transition-colors ${
                pathname.startsWith("/times")
                  ? "text-green border-b-2 border-green"
                  : "text-text-secondary hover:text-green"
              }`}
            >
              Times
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === "times" ? "rotate-180" : ""}`} />
            </button>

            {openDropdown === "times" && (
              <div className="absolute top-full left-0 bg-surface border border-border-custom rounded-lg shadow-lg p-4 z-50 w-[460px] max-h-[70vh] overflow-y-auto">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                  Brasileirao Serie A
                </h4>
                <div className="grid grid-cols-2 gap-1">
                  {PANEL_TEAMS_BR.map((team) => (
                    <Link
                      key={team.slug}
                      href={`/futebol/times/${team.slug}`}
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-center gap-2.5 py-2 px-2.5 rounded-md text-sm text-text-secondary hover:text-green hover:bg-green-light transition-colors"
                    >
                      <Image
                        src={`/img/team/${team.id}/image`}
                        alt=""
                        width={22}
                        height={22}
                        className="rounded-full"
                        unoptimized
                      />
                      <span className="font-medium">{team.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </li>

          {/* ========== FUTEBOL (atalhos rapidos) ========== */}
          <li className="relative">
            <button
              onClick={() => toggleDropdown("futebol")}
              className={`flex items-center gap-1 px-3 py-3 font-semibold whitespace-nowrap transition-colors ${
                pathname.startsWith("/futebol")
                  ? "text-green border-b-2 border-green"
                  : "text-text-secondary hover:text-green"
              }`}
            >
              Futebol
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === "futebol" ? "rotate-180" : ""}`} />
            </button>

            {openDropdown === "futebol" && (
              <div className="absolute top-full left-0 bg-surface border border-border-custom rounded-lg shadow-lg p-2 z-50 min-w-[220px]">
                <ul className="space-y-0.5">
                  {[
                    { label: "Jogos de Hoje", href: "/agenda" },
                    { label: "Onde Assistir", href: "/futebol/onde-assistir" },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} onClick={() => setOpenDropdown(null)} className="block py-1.5 px-2 text-sm text-text-secondary hover:text-green hover:bg-green-light rounded transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                  <li><div className="my-1 border-t border-border-custom" /></li>
                  {[
                    { label: "Brasileirao", href: "/futebol/brasileirao-serie-a" },
                    { label: "Champions League", href: "/futebol/champions-league" },
                    { label: "Libertadores", href: "/futebol/libertadores" },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} onClick={() => setOpenDropdown(null)} className="block py-1.5 px-2 text-sm text-text-secondary hover:text-green hover:bg-green-light rounded transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                  <li><div className="my-1 border-t border-border-custom" /></li>
                  {[
                    { label: "Selecao Brasileira", href: "/futebol/selecao-brasileira" },
                    { label: "Copa do Mundo 2026", href: "/noticias?cat=Copa%20do%20Mundo" },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} onClick={() => setOpenDropdown(null)} className="block py-1.5 px-2 text-sm text-text-secondary hover:text-green hover:bg-green-light rounded transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>

          {/* ========== ESPORTES ========== */}
          <li className="relative">
            <button
              onClick={() => toggleDropdown("esportes")}
              className={`flex items-center gap-1 px-3 py-3 font-semibold whitespace-nowrap transition-colors ${
                SPORTS.some((s) => pathname.startsWith(s.href))
                  ? "text-green border-b-2 border-green"
                  : "text-text-secondary hover:text-green"
              }`}
            >
              Esportes
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === "esportes" ? "rotate-180" : ""}`} />
            </button>

            {openDropdown === "esportes" && (
              <div className="absolute top-full left-0 bg-surface border border-border-custom rounded-lg shadow-lg p-4 z-50 min-w-[200px]">
                <ul className="space-y-1">
                  {SPORTS.map((sport) => (
                    <li key={sport.slug}>
                      <Link
                        href={sport.href}
                        onClick={() => setOpenDropdown(null)}
                        className="block py-1.5 px-2 text-sm text-text-secondary hover:text-green hover:bg-green-light rounded transition-colors"
                      >
                        {sport.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>

          {/* Jogos de Hoje (label aponta pra /agenda — CBF calendar) */}
          <li>
            <Link
              href="/agenda"
              className={`block px-3 py-3 font-semibold whitespace-nowrap transition-colors ${
                pathname === "/agenda"
                  ? "text-green border-b-2 border-green"
                  : "text-text-secondary hover:text-green"
              }`}
            >
              Jogos de Hoje
            </Link>
          </li>

          {/* Onde Assistir */}
          <li>
            <Link
              href="/futebol/onde-assistir"
              className={`block px-3 py-3 font-semibold whitespace-nowrap transition-colors ${
                pathname === "/futebol/onde-assistir"
                  ? "text-green border-b-2 border-green"
                  : "text-text-secondary hover:text-green"
              }`}
            >
              Onde Assistir
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
