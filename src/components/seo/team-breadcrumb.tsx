"use client";

import { usePathname } from "next/navigation";
import { PageBreadcrumb, type BreadcrumbItem } from "./page-breadcrumb";

const SUBROUTE_LABELS: Record<string, string> = {
  "jogo-hoje": "Jogo de Hoje",
  "onde-assistir": "Onde Assistir",
  "escalacao": "Escalação",
  "proximos-jogos": "Próximos Jogos",
  "estatisticas": "Estatísticas 2026",
};

interface TeamBreadcrumbProps {
  teamSlug: string;
  teamName: string;
  className?: string;
}

export function TeamBreadcrumb({ teamSlug, teamName, className }: TeamBreadcrumbProps) {
  const pathname = usePathname();
  const match = pathname.match(/^\/futebol\/times\/[^/]+\/([^/]+)/);
  const subroute = match?.[1];
  const subrouteLabel = subroute ? SUBROUTE_LABELS[subroute] : undefined;

  const items: BreadcrumbItem[] = [{ label: "Início", href: "/" }];
  if (subrouteLabel) {
    items.push({ label: teamName, href: `/futebol/times/${teamSlug}` });
    items.push({ label: subrouteLabel });
  } else {
    items.push({ label: teamName });
  }

  return <PageBreadcrumb items={items} className={className} />;
}
