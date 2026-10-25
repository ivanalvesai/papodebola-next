"use client";

import { usePathname } from "next/navigation";
import { teamTabH1 } from "@/lib/team-h1";

// H1 do cluster do time, específico da aba (o layout é compartilhado entre as 6 abas).
// Client só pra ler o pathname — sai no HTML do SSR igual.
export function TeamH1({ name }: { name: string }) {
  const pathname = usePathname() || "";
  return <h1 className="text-xl font-bold text-text-primary">{teamTabH1(pathname, name)}</h1>;
}
