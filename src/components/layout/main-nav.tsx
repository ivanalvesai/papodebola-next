"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
import { useSidePanel } from "./side-panel-context";

interface NavLink {
  label: string;
  href: string;
}

interface NavGroup {
  title: string;
  links: NavLink[];
}

interface NavItem {
  label: string;
  href?: string;
  groups?: NavGroup[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Brasil",
    groups: [
      {
        title: "Nacionais",
        links: [
          { label: "Brasileirão Série A", href: "/campeonato/brasileirao-serie-a" },
          { label: "Brasileirão Série B", href: "/campeonato/brasileirao-serie-b" },
          { label: "Copa do Brasil", href: "/campeonato/copa-do-brasil" },
        ],
      },
      {
        title: "Estaduais",
        links: [
          { label: "Paulista", href: "/campeonato/paulista" },
          { label: "Carioca", href: "/campeonato/carioca" },
          { label: "Mineiro", href: "/campeonato/mineiro" },
        ],
      },
    ],
  },
  {
    label: "Sul-Americano",
    groups: [
      {
        title: "",
        links: [
          { label: "Libertadores", href: "/campeonato/libertadores" },
          { label: "Sudamericana", href: "/campeonato/sudamericana" },
        ],
      },
    ],
  },
  {
    label: "Europa",
    groups: [
      {
        title: "UEFA",
        links: [
          { label: "Champions League", href: "/campeonato/champions-league" },
          { label: "Europa League", href: "/campeonato/europa-league" },
        ],
      },
      {
        title: "Ligas",
        links: [
          { label: "Premier League", href: "/campeonato/premier-league" },
          { label: "La Liga", href: "/campeonato/la-liga" },
          { label: "Serie A", href: "/campeonato/serie-a-italia" },
          { label: "Bundesliga", href: "/campeonato/bundesliga" },
        ],
      },
    ],
  },
  {
    label: "Esportes",
    groups: [
      {
        title: "Populares",
        links: [
          { label: "NBA", href: "/esporte/nba" },
          { label: "Tênis", href: "/esporte/tenis" },
          { label: "Fórmula 1", href: "/esporte/f1" },
          { label: "MMA / UFC", href: "/esporte/mma" },
        ],
      },
      {
        title: "Mais",
        links: [
          { label: "Vôlei", href: "/esporte/volei" },
          { label: "eSports", href: "/esporte/esports" },
          { label: "NFL", href: "/esporte/nfl" },
        ],
      },
    ],
  },
  { label: "Notícias", href: "/noticias" },
  { label: "Agenda", href: "/agenda" },
];

export function MainNav() {
  const pathname = usePathname();
  const { toggle } = useSidePanel();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  function toggleMobileDropdown(label: string) {
    setOpenDropdown(openDropdown === label ? null : label);
  }

  return (
    <nav className="bg-nav-bg border-b border-border-custom shadow-sm sticky top-14 z-40">
      <div className="mx-auto max-w-[1240px] px-4">
        <ul className="flex items-center gap-0 overflow-x-auto scrollbar-hide text-sm">
          {/* Menu button */}
          <li>
            <button
              onClick={toggle}
              className="flex items-center gap-1.5 px-3 py-3 text-text-secondary hover:text-green font-semibold transition-colors whitespace-nowrap"
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
          </li>

          {/* Home */}
          <li>
            <Link
              href="/"
              className={`block px-3 py-3 font-semibold whitespace-nowrap transition-colors ${
                pathname === "/"
                  ? "text-green border-b-2 border-green"
                  : "text-text-secondary hover:text-green"
              }`}
            >
              Início
            </Link>
          </li>

          {/* Nav items */}
          {NAV_ITEMS.map((item) =>
            item.href ? (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`block px-3 py-3 font-semibold whitespace-nowrap transition-colors ${
                    pathname.startsWith(item.href)
                      ? "text-green border-b-2 border-green"
                      : "text-text-secondary hover:text-green"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ) : (
              <li key={item.label} className="relative group">
                {/* Desktop: hover dropdown */}
                <button
                  className="hidden md:flex items-center gap-1 px-3 py-3 font-semibold text-text-secondary hover:text-green transition-colors whitespace-nowrap"
                  onClick={() => toggleMobileDropdown(item.label)}
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {/* Mobile: click dropdown */}
                <button
                  className="md:hidden flex items-center gap-1 px-3 py-3 font-semibold text-text-secondary hover:text-green transition-colors whitespace-nowrap"
                  onClick={() => toggleMobileDropdown(item.label)}
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute top-full left-0 bg-surface border border-border-custom rounded-lg shadow-lg p-4 z-50 min-w-[200px]
                    md:invisible md:opacity-0 md:group-hover:visible md:group-hover:opacity-100 md:transition-all md:duration-200
                    ${openDropdown === item.label ? "block" : "hidden md:block"}
                    ${item.groups && item.groups.length > 1 ? "md:flex md:gap-6 md:min-w-[380px]" : ""}
                  `}
                >
                  {item.groups?.map((group) => (
                    <div key={group.title || "default"} className="mb-3 last:mb-0">
                      {group.title && (
                        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                          {group.title}
                        </h4>
                      )}
                      <ul className="space-y-1">
                        {group.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="block py-1.5 px-2 text-sm text-text-secondary hover:text-green hover:bg-green-light rounded transition-colors"
                              onClick={() => setOpenDropdown(null)}
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </li>
            )
          )}
        </ul>
      </div>
    </nav>
  );
}
