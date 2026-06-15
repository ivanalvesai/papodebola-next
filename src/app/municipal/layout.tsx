import type { Metadata } from "next";

// /municipal é um client component (não pode exportar metadata), então o SEO
// — inclusive o canonical — vive aqui no layout server.
export const metadata: Metadata = {
  title: "Futebol Municipal de Santana de Parnaíba",
  description:
    "Tabelas, jogos e resultados dos campeonatos municipais de futebol de Santana de Parnaíba (SisGel).",
  alternates: { canonical: "/municipal" },
};

export default function MunicipalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
