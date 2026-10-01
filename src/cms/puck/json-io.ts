// Importar/exportar o JSON do Construtor (Puck) e inserir Trecho. Puro (sem React): testado.
/* eslint-disable @typescript-eslint/no-explicit-any */

export type PuckJsonResult = { ok: true; data: any } | { ok: false; error: string };

export function newId(type: string): string {
  const rnd =
    typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function"
      ? (crypto as any).randomUUID()
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `${type}-${rnd}`;
}

const isItem = (v: any) => v && typeof v === "object" && !Array.isArray(v) && typeof v.type === "string" && "props" in v;

// Confere o tipo de cada componente (inclusive dentro de slots) e garante props.id.
function checkItems(items: any[], names: Set<string>, where: string): string | null {
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!it || typeof it !== "object" || typeof it.type !== "string") return `${where}: o item ${i + 1} não tem "type".`;
    if (!names.has(it.type)) return `${where}: componente desconhecido "${it.type}".`;
    if (!it.props || typeof it.props !== "object" || Array.isArray(it.props)) it.props = {};
    if (!it.props.id) it.props.id = newId(it.type);
    for (const [k, v] of Object.entries(it.props)) {
      if (Array.isArray(v) && v.length && v.every(isItem)) {
        const err = checkItems(v, names, `${it.type} → ${k}`);
        if (err) return err;
      }
    }
  }
  return null;
}

export function parsePuckJson(text: string, componentNames: string[]): PuckJsonResult {
  let raw: any;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "JSON inválido: confira se colou o conteúdo inteiro." };
  }
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.content)) {
    return { ok: false, error: 'O JSON precisa ser um objeto com a lista "content".' };
  }
  const names = new Set(componentNames);
  const err = checkItems(raw.content, names, "Conteúdo");
  if (err) return { ok: false, error: err };
  const zones = raw.zones && typeof raw.zones === "object" && !Array.isArray(raw.zones) ? raw.zones : {};
  for (const [zone, items] of Object.entries(zones)) {
    if (!Array.isArray(items)) return { ok: false, error: `A zona "${zone}" não é uma lista.` };
    const zErr = checkItems(items, names, `Zona ${zone}`);
    if (zErr) return { ok: false, error: zErr };
  }
  const root = raw.root && typeof raw.root === "object" ? raw.root : { props: {} };
  return { ok: true, data: { content: raw.content, root, zones } };
}

export function snippetItem(snippet: { id: any; title?: string }) {
  return { type: "Snippet", props: { id: newId("Snippet"), snippet } };
}
