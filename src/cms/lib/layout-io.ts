/* eslint-disable @typescript-eslint/no-explicit-any */
export function stripIds(x: any): any {
  if (Array.isArray(x)) return x.map(stripIds);
  if (x && typeof x === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(x)) if (k !== "id") out[k] = stripIds(v);
    return out;
  }
  return x;
}
export function parseLayoutImport(raw: string, knownSlugs: readonly string[]): { ok: true; data: { layout: any[]; hero?: any; layoutStyle?: any } } | { ok: false; error: string } {
  let parsed: any;
  try { parsed = JSON.parse(raw); } catch { return { ok: false, error: "JSON inválido. Cole exatamente o que foi exportado/gerado." }; }
  const layout = Array.isArray(parsed) ? parsed : parsed?.layout;
  if (!Array.isArray(layout)) return { ok: false, error: "Não encontrei a lista 'layout' de blocos." };
  for (const [i, b] of layout.entries()) {
    if (!b || typeof b !== "object" || typeof b.blockType !== "string") return { ok: false, error: `Bloco ${i + 1} sem 'blockType'.` };
    if (!knownSlugs.includes(b.blockType)) return { ok: false, error: `Bloco ${i + 1}: tipo "${b.blockType}" não existe neste site.` };
  }
  const data: any = { layout: stripIds(layout) };
  if (!Array.isArray(parsed)) { if (parsed.hero) data.hero = stripIds(parsed.hero); if (parsed.layoutStyle) data.layoutStyle = stripIds(parsed.layoutStyle); }
  return { ok: true, data };
}
