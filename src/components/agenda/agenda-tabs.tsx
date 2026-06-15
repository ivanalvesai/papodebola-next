import Link from "next/link";

// Abas da seção Agenda: Geral (multiesporte) | Futebol (calendário CBF).
export function AgendaTabs({ active }: { active: "geral" | "futebol" }) {
  const tabs = [
    { label: "Geral", href: "/jogos-de-hoje", key: "geral" as const },
    { label: "Futebol", href: "/jogos-de-hoje/futebol", key: "futebol" as const },
  ];
  return (
    <div className="flex gap-1 mb-6 border-b border-border-custom">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            active === t.key
              ? "text-green border-green"
              : "text-text-muted border-transparent hover:text-text-secondary"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
