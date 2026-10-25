// Caminhos mortos que bots ainda pedem e que NÃO têm redirect no next.config: o cache
// JSON do site estático antigo e arquivos soltos do Papo de Bola de 2005. 410 diz ao
// Google que sumiram de vez (para de rastrear). Prefixos legados com conteúdo editorial
// (/24horas, /papodemidia, /index.htm...) têm 301 intencional no next.config (equity de
// backlinks) e os redirects rodam antes do middleware — não entram aqui.
const GONE_PREFIXES = ["/cache/", "/contagiro/", "/fabiocunha/", "/pernambucoaqui/"];
const GONE_EXACT = new Set(["/index24horas.jpg", "/indexpapodemidia.jpg", "/PB2018v2.png"]);

export function isGonePath(pathname: string): boolean {
  return GONE_EXACT.has(pathname) || GONE_PREFIXES.some((p) => pathname.startsWith(p));
}
