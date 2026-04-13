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

          {/* Inicio */}
          <li>
            <Link
              href="/"
              className={`block px-3 py-3 font-semibold whitespace-nowrap transition-colors ${
                pathname === "/"
                  ? "text-green border-b-2 border-green"
                  : "text-text-secondary hover:text-green"
              }`}
            >
              Inicio
            </Link>
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
                      href={`/times/${team.slug}`}
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

          {/* ========== FUTEBOL ========== */}
          <li className="relative">
            <button
              onClick={() => toggleDropdown("futebol")}
              className={`flex items-center gap-1 px-3 py-3 font-semibold whitespace-nowrap transition-colors ${
                pathname.startsWith("/campeonato")
                  ? "text-green border-b-2 border-green"
                  : "text-text-secondary hover:text-green"
              }`}
            >
              Futebol
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === "futebol" ? "rotate-180" : ""}`} />
            </button>

            {openDropdown === "futebol" && (
              <div className="absolute top-full left-0 bg-surface border border-border-custom rounded-lg shadow-lg p-4 z-50 flex gap-6 min-w-[480px]">
                <div>
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Brasil
                  </h4>
                  <ul className="space-y-1">
                    {[
                      { label: "Brasileirao Serie A", href: "/campeonato/brasileirao-serie-a" },
                      { label: "Brasileirao Serie B", href: "/campeonato/brasileirao-serie-b" },
                      { label: "Copa do Brasil", href: "/campeonato/copa-do-brasil" },
                      { label: "Copa do Nordeste", href: "/campeonato/copa-do-nordeste" },
                    ].map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} onClick={() => setOpenDropdown(null)} className="block py-1.5 px-2 text-sm text-text-secondary hover:text-green hover:bg-green-light rounded transition-colors">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 mt-4">
                    Municipal
                  </h4>
                  <ul className="space-y-1">
                    <li>
                      <Link href="/municipal" onClick={() => setOpenDropdown(null)} className="block py-1.5 px-2 text-sm text-text-secondary hover:text-green hover:bg-green-light rounded transition-colors">
                        Santana de Parnaiba
                      </Link>
                    </li>
                  </ul>

                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 mt-4">
                    Estaduais
                  </h4>
                  <ul className="space-y-1">
                    {[
                      { label: "Paulista", href: "/campeonato/paulista" },
                      { label: "Carioca", href: "/campeonato/carioca" },
                      { label: "Mineiro", href: "/campeonato/mineiro" },
                      { label: "Gaucho", href: "/campeonato/gaucho" },
                    ].map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} onClick={() => setOpenDropdown(null)} className="block py-1.5 px-2 text-sm text-text-secondary hover:text-green hover:bg-green-light rounded transition-colors">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Sul-Americano
                  </h4>
                  <ul className="space-y-1">
                    {[
                      { label: "Libertadores", href: "/campeonato/libertadores" },
                      { label: "Sudamericana", href: "/campeonato/sudamericana" },
                    ].map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} onClick={() => setOpenDropdown(null)} className="block py-1.5 px-2 text-sm text-text-secondary hover:text-green hover:bg-green-light rounded transition-colors">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 mt-4">
                    Europa
                  </h4>
                  <ul className="space-y-1">
                    {[
                      { label: "Champions League", href: "/campeonato/champions-league" },
                      { label: "Europa League", href: "/campeonato/europa-league" },
                      { label: "Premier League", href: "/campeonato/premier-league" },
                      { label: "La Liga", href: "/campeonato/la-liga" },
                      { label: "Serie A (Italia)", href: "/campeonato/serie-a-italia" },
                      { label: "Bundesliga", href: "/campeonato/bundesliga" },
                      { label: "Ligue 1", href: "/campeonato/ligue-1" },
                    ].map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} onClick={() => setOpenDropdown(null)} className="block py-1.5 px-2 text-sm text-text-secondary hover:text-green hover:bg-green-light rounded transition-colors">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </li>

          {/* ========== ESPORTES ========== */}
          <li className="relative">
            <button
              onClick={() => toggleDropdown("esportes")}
              className={`flex items-center gap-1 px-3 py-3 font-semibold whitespace-nowrap transition-colors ${
                pathname.startsWith("/esporte")
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
                        href={`/esporte/${sport.slug}`}
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
        </ul>
      </div>
    </nav>
  );
}
