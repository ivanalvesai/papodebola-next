import Link from "next/link";
import type { TeamMatch } from "@/lib/data/team";

// Card de jogo clicável: com página do jogo vira <Link>, sem página fica <div> (mesmo
// visual). Não pôr links de time DENTRO do card (seria <a> dentro de <a>).
export function MatchLink({
  match,
  className,
  children,
}: {
  match: Pick<TeamMatch, "href">;
  className?: string;
  children: React.ReactNode;
}) {
  return match.href ? (
    <Link href={match.href} className={className}>
      {children}
    </Link>
  ) : (
    <div className={className}>{children}</div>
  );
}

// Nome do time: link pra página dele quando existe no cluster, texto puro senão.
export function TeamNameLink({ slug, name, className }: { slug: string | null; name: string; className?: string }) {
  return slug ? (
    <Link href={`/futebol/times/${slug}`} className={className}>
      {name}
    </Link>
  ) : (
    <span className={className}>{name}</span>
  );
}
