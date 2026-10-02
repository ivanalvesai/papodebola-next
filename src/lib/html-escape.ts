// Escapes de HTML e filtro de URLs perigosas pros conversores Lexical → HTML (posts e
// páginas do CMS). Puro (sem imports): testado em html-escape.test.ts.

export function escHtml(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
export function escAttr(s: unknown): string {
  return escHtml(s).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Decodifica as entidades que costumam esconder o esquema (&#106; &#x6a; &colon; &Tab;…)
// e remove espaços/controles, como o navegador faz antes de olhar o esquema.
function normalizeScheme(u: string): string {
  return String(u || "")
    .replace(/&#x([0-9a-f]+);?/gi, (_, h) => String.fromCodePoint(parseInt(h, 16) || 32))
    .replace(/&#(\d+);?/g, (_, d) => String.fromCodePoint(Number(d) || 32))
    .replace(/&colon;/gi, ":")
    .replace(/&(tab|newline);/gi, "")
    .replace(/[\u0000- \u007f-\u009f]/g, "")
    .toLowerCase();
}

// Url segura pra href/src: javascript:, vbscript: e data: (exceto imagem raster) viram "".
export function safeUrl(u: unknown): string {
  const raw = String(u ?? "").trim();
  const n = normalizeScheme(raw);
  if (/^(javascript|vbscript):/.test(n)) return "";
  if (/^data:/.test(n) && !/^data:image\/(png|jpe?g|gif|webp|avif);/.test(n)) return "";
  return raw;
}

// Pós-processamento do HTML gerado: troca por "#" todo href/src/action com esquema perigoso
// (cobre o conversor de link PADRÃO do Payload, que não filtra `javascript:`).
const URL_ATTR = /(\s(?:href|src|xlink:href|action|formaction|poster))\s*=\s*("([^"]*)"|'([^']*)'|([^\s>"']+))/gi;
export function stripUnsafeUrls(html: string): string {
  return String(html || "").replace(URL_ATTR, (full, attr, _q, dq, sq, bare) => {
    const v = dq ?? sq ?? bare ?? "";
    return safeUrl(v) === "" && v.trim() !== "" ? `${attr}="#"` : full;
  });
}

// Bloco de vídeo (YouTube/Vimeo) do editor: `src` já vem montado a partir de um id validado.
export function videoFigureHtml(src: string, caption?: unknown): string {
  const cap = String(caption ?? "").trim();
  const figcap = cap ? `<figcaption>${escHtml(cap)}</figcaption>` : "";
  return `<figure class="pdb-video"><div class="pdb-video-frame"><iframe src="${escAttr(src)}" title="${escAttr(cap || "Vídeo")}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>${figcap}</figure>`;
}
