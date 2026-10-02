import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/build-metadata";

// /municipal é um client component (não pode exportar metadata), então o SEO
// — inclusive o canonical — vive aqui no layout server.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("/sp/santana-de-parnaiba/municipal", {
    title: "Futebol Municipal de Santana de Parnaíba",
    description:
      "Tabelas, jogos e resultados dos campeonatos municipais de futebol de Santana de Parnaíba (SisGel).",
    alternates: { canonical: "/sp/santana-de-parnaiba/municipal" },
  });
}

export default function MunicipalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
