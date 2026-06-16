import { getArticleBySlug } from "./articles";
import type { Article } from "@/types/article";

// Craques históricos (recriação do antigo "Vida de Craque"). O CONTEÚDO — texto e
// foto destacada — vive no WordPress, editável pela redação. Aqui só listamos os
// slugs que são craques (whitelist), pra a rota /futebol/craque/[slug] e o
// generateStaticParams. Adicionar um craque = criar o post no WP com o slug + incluir
// o slug aqui (+ o 301 da URL .htm antiga no next.config).
export const CRAQUE_SLUGS = [
  "socrates",
  "nilton-santos",
  "rivellino",
  "hugo-gatti",
  "aymore-moreira",
  "julinho-botelho",
  "dirceu-lopes",
  "edgardo-andrada",
];

export async function getCraques(): Promise<Article[]> {
  const list = await Promise.all(
    CRAQUE_SLUGS.map((s) => getArticleBySlug(s).catch(() => null))
  );
  return list.filter((a): a is Article => !!a);
}

export async function getCraqueBySlug(slug: string): Promise<Article | null> {
  if (!CRAQUE_SLUGS.includes(slug)) return null;
  return getArticleBySlug(slug).catch(() => null);
}
