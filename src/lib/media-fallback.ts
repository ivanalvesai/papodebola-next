// A mídia do CMS é convertida pra WebP no upload (formatOptions), mas o Google Imagens
// e HTMLs antigos ainda pedem o nome original (.jpg/.png) → o Payload estoura 500.
// Devolve o nome .webp equivalente (só nome simples, sem diretório) ou null.
export function webpFallbackName(filename: string): string | null {
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) return null;
  const m = filename.match(/^(.+)\.(jpe?g|png)$/i);
  return m ? `${m[1]}.webp` : null;
}
