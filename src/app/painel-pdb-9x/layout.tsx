"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Users, Gamepad2, Settings, LogOut, Sparkles } from "lucide-react";

const TABS = [
  { href: "/painel-pdb-9x/artigos", label: "Artigos", icon: FileText },
  { href: "/painel-pdb-9x/usuarios", label: "Usuarios", icon: Users },
  { href: "/painel-pdb-9x/jogos", label: "Jogos", icon: Gamepad2 },
  { href: "/painel-pdb-9x/config", label: "Config", icon: Settings },
  { href: "/studio-pdb", label: "Studio", icon: Sparkles, external: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/painel-pdb-9x/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch("/api/auth/login", { method: "DELETE" }).catch(() => {});
    document.cookie = "pdb_auth=; path=/; max-age=0";
    window.location.href = "/painel-pdb-9x/login";
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-text-primary">Painel Admin</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-red transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border-custom mb-6">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            target={"external" in tab ? "_blank" : undefined}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              pathname.startsWith(tab.href)
                ? "text-green border-green"
                : "text-text-muted border-transparent hover:text-text-secondary"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {"external" in tab && <span className="text-[9px] bg-green text-white px-1 py-0.5 rounded ml-1">NEW</span>}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
