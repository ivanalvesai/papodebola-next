import React from "react";

type Card = { title: string; desc: string; href: string; roles: string[]; blank?: boolean };

const CARDS: Card[] = [
  { title: "Nova página", desc: "Criar uma página do zero ou de um modelo", href: "/cms/collections/pages/create", roles: ["admin", "editor"] },
  { title: "Páginas", desc: "Editar as páginas do site", href: "/cms/collections/pages", roles: ["admin", "editor"] },
  { title: "Modelos", desc: "Layouts prontos para começar uma página", href: "/cms/collections/pageTemplates", roles: ["admin", "editor"] },
  { title: "Trechos", desc: "Grupos de blocos reutilizáveis", href: "/cms/collections/snippets", roles: ["admin", "editor"] },
  { title: "Formulários", desc: "Criar e editar formulários", href: "/cms/collections/forms", roles: ["admin", "editor"] },
  { title: "Respostas", desc: "Ver o que foi enviado nos formulários", href: "/cms/collections/form-submissions", roles: ["admin", "editor"] },
  { title: "Posts", desc: "Notícias e artigos", href: "/cms/collections/posts", roles: ["admin", "editor"] },
  { title: "Textos e SEO", desc: "Títulos e descrições das páginas", href: "/cms/collections/pageTexts", roles: ["admin", "editor", "seo"] },
  { title: "Configurações do site", desc: "Dados gerais do portal", href: "/cms/globals/siteSettings", roles: ["admin", "editor", "seo"] },
  { title: "Ver o site", desc: "Abrir o portal em outra aba", href: "/", roles: ["admin", "editor", "seo"], blank: true },
  { title: "Guia", desc: "Passo a passo de como usar o CMS", href: "/cms-guia", roles: ["admin", "editor", "seo"], blank: true },
];

// Server component: o Payload injeta `user` nas props de beforeDashboard.
export function DashboardShortcuts(props: { user?: { roles?: string[] | null } | null }) {
  const roles = props.user?.roles?.length ? props.user.roles : ["editor"];
  const cards = CARDS.filter((c) => c.roles.some((r) => roles.includes(r)));
  return (
    <nav className="pdb-dash" aria-label="Atalhos">
      {cards.map((c) => (
        <a key={c.href} href={c.href} {...(c.blank ? { target: "_blank", rel: "noopener" } : {})}>
          <strong>{c.title}</strong>
          <span>{c.desc}</span>
        </a>
      ))}
    </nav>
  );
}
