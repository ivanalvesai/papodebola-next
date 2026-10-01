import { RESERVED_TOP_LEVEL, TOURNAMENT_BY_SLUG } from "../../lib/config.ts";
import { dedicatedPageRoute } from "../../lib/dedicated-pages.ts";

// Caminhos que o CMS pode ou não usar. Regra: rota em CÓDIGO sempre ganha. Aqui só
// impedimos o editor de gravar um caminho que nunca vai responder (ou que colide).

// Rotas estáticas de 1 segmento que existem em src/app/(site) (um CMS path igual nunca responderia).
export const STATIC_TOP_LEVEL = new Set([
  "apostas", "boxe", "combate", "esports", "formula-1", "futebol", "futebol-americano", "futsal", "nba", "tenis", "volei",
  "sobre", "contato", "parceiros", "politica-de-privacidade", "termos-de-uso", "casas-de-apostas",
]);
// Árvores inteiramente do código (qualquer coisa abaixo é recusada).
// Só "futebol" sai de RESERVED_TOP_LEVEL (/futebol/[slug] faz fallthrough). /sobre/x etc. seguem reservados.
export const RESERVED_FIRST_SEGMENTS = new Set([
  ...[...RESERVED_TOP_LEVEL].filter((s) => s !== "futebol"), "api", "cms", "cms-api", "cms-preview", "paginas", "img", "_next",
  "autor", "studio-pdb", "painel-pdb-9x", "sitemap.xml", "robots.txt", "manifest.webmanifest", "llms.txt",
  "admin", "not-found", "parceiro",
]);
// Fontes dos redirects do next.config.ts (e rotas de código aninhadas): o redirect/rota
// roda antes da página do CMS, então esses caminhos nunca responderiam.
export const RESERVED_EXACT_PATHS = new Set([
  "/privacidade", "/termos", "/municipal", "/basquete", "/basquete/nba",
  "/futebol/jogos-hoje", "/futebol/brasileirao", "/futebol/internacional", "/futebol/mercado-da-bola",
  "/futebol/eliminatorias", "/futebol/brasileiro", "/futebol-brasileiro", "/futebol-internacional",
  "/mma", "/nfl", "/paginas", "/autor", "/proximos-jogos", "/index.htm",
]);
// Fontes com curinga (:path*, :slug*, :slug, :sub*): o caminho e tudo abaixo.
export const RESERVED_PREFIXES = [
  "/agenda", "/casas-de-apostas", "/campeonato", "/times", "/esporte",
  "/jogos-de-futebol", "/jogos-de-jogos-de-hoje", "/futebol/copa_do_mundo",
  "/vidadecraque", "/goleiros", "/papodemidia", "/papoespecial", "/24horas", "/20perguntas",
  "/toquedeclasse", "/chutandodebrito", "/futebolestranho", "/futebolnarede",
  "/especiais", "/premiobrasileirao2006", "/naturmadoamendoim",
  "/tenis/halle-2026",
];
const REDIRECT_MSG = "Esse caminho já é usado por um redirecionamento ou rota do site.";
// Subárvores do /futebol que são código.
const FUTEBOL_CODE = new Set(["times", "copa-do-mundo", "copa-do-mundo-feminina", "selecao-brasileira", "selecoes", "craque", "onde-assistir"]);

export function normalizePath(v: string | undefined | null): string {
  const s = String(v ?? "").trim();
  return s.length > 1 ? s.replace(/\/+$/, "") : s;
}

export function validatePath(value: string | undefined | null): true | string {
  const v = String(value ?? "").trim();
  if (!v) return true;
  if (!v.startsWith("/")) return "O caminho precisa começar com / (ex.: /volei/mundial-2026).";
  if (v.length > 1 && v.endsWith("/")) return "Sem barra no final.";
  const segs = v.slice(1).split("/");
  if (segs.length > 6) return "Máximo de 6 segmentos.";
  const [first, second] = segs;
  if (segs.length === 1 && STATIC_TOP_LEVEL.has(first)) return `A rota /${first} já existe no site.`;
  if (RESERVED_FIRST_SEGMENTS.has(first)) return `"/${first}" é reservado ao código do site.`;
  if (RESERVED_EXACT_PATHS.has(v) || RESERVED_PREFIXES.some((p) => v === p || v.startsWith(`${p}/`))) return REDIRECT_MSG;
  if (!segs.every((s) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s))) return "Use só letras minúsculas, números e hífens em cada parte.";
  if (first === "futebol") {
    if (FUTEBOL_CODE.has(second)) return `"/futebol/${second}" é reservado ao código do site.`;
    if (TOURNAMENT_BY_SLUG[second]) return `/futebol/${second} já existe (campeonato).`;
    if (segs.length > 2) return "Abaixo de /futebol só é possível 1 nível (ex.: /futebol/copa-america).";
  }
  return true;
}

// Validador do campo "Caminho" da collection pages: página com rota dedicada (sobre,
// contato, apostas…) não pode ganhar outro caminho — ela já responde na rota própria.
export function validatePagePath(value: string | undefined | null, slug: string | undefined | null): true | string {
  const v = String(value ?? "").trim();
  if (v) {
    const route = slug ? dedicatedPageRoute(slug) : null;
    if (route) return `Esta página já tem rota própria (${route}); deixe o Caminho vazio.`;
  }
  return validatePath(value);
}
