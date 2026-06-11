import { slugifyCategory } from "@/lib/config";

// 48 seleções da Copa do Mundo 2026 — id (Sofascore) + nome PT-BR.
// Hardcoded (não depende da API, que é pulada no build). Mantém em sincronia
// com os escudos/bandeiras servidos em /img/team/{id}/image.
const RAW: [number, string][] = [
  [4691, "Argélia"], [4819, "Argentina"], [4741, "Austrália"], [4718, "Áustria"],
  [4717, "Bélgica"], [4479, "Bósnia e Herzegovina"], [4748, "Brasil"], [4753, "Cabo Verde"],
  [4752, "Canadá"], [4820, "Colômbia"], [4715, "Croácia"], [55827, "Curaçao"],
  [4714, "Tchéquia"], [4768, "Costa do Marfim"], [4823, "RD Congo"], [4757, "Equador"],
  [4758, "Egito"], [4713, "Inglaterra"], [4481, "França"], [4711, "Alemanha"],
  [4764, "Gana"], [7229, "Haiti"], [4766, "Irã"], [4767, "Iraque"],
  [4770, "Japão"], [4771, "Jordânia"], [4781, "México"], [4778, "Marrocos"],
  [4705, "Holanda"], [4784, "Nova Zelândia"], [4475, "Noruega"], [5164, "Panamá"],
  [4789, "Paraguai"], [4704, "Portugal"], [4792, "Catar"], [4834, "Arábia Saudita"],
  [4695, "Escócia"], [4739, "Senegal"], [4736, "África do Sul"], [4735, "Coreia do Sul"],
  [4698, "Espanha"], [4688, "Suécia"], [4699, "Suíça"], [4729, "Tunísia"],
  [4700, "Turquia"], [4724, "Estados Unidos"], [4725, "Uruguai"], [4723, "Uzbequistão"],
];

export interface Selecao {
  id: number;
  name: string;
  slug: string;
}

// Brasil tem página própria (/futebol/selecao-brasileira) — não entra em /selecoes/[slug]
export const BRAZIL_ID = 4748;

// Ordem alfabética (pt-BR) pra não privilegiar ninguém
export const SELECOES: Selecao[] = RAW.map(([id, name]) => ({
  id,
  name,
  slug: slugifyCategory(name),
})).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

export const SELECAO_BY_SLUG: Record<string, Selecao> = Object.fromEntries(
  SELECOES.map((s) => [s.slug, s])
);

export const SELECAO_BY_ID: Record<number, Selecao> = Object.fromEntries(
  SELECOES.map((s) => [s.id, s])
);

// Slug de uma seleção pelo id Sofascore (usado pra montar a URL do jogo).
// Fallback: se o id não estiver no mapa (ex: time fora das 48), slugifica o nome dado.
export function selecaoSlugById(id: number, fallbackName?: string): string {
  return SELECAO_BY_ID[id]?.slug || (fallbackName ? slugifyCategory(fallbackName) : String(id));
}

// Link da seleção: Brasil vai pra página dedicada; as outras pra /selecoes/[slug]
export function selecaoHref(s: Selecao): string {
  return s.id === BRAZIL_ID ? "/futebol/selecao-brasileira" : `/futebol/selecoes/${s.slug}`;
}
