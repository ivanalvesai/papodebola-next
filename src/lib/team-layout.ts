type LayoutBlock = { blockType?: string; content?: unknown; text?: unknown };

// Layout contém a "Página padrão do time" (bloco teamClassic)? Nesse caso a aba renderiza
// o componente clássico no lugar do bloco, com os textos do editor antes/depois.
export function hasClassicBlock(blocks: { blockType?: string }[]): boolean {
  return blocks.some((b) => b?.blockType === "teamClassic");
}

// Layout personalizado de time: o texto automático aparece onde o editor pôs o bloco
// "teamAutoText". Se ele não pôs, anexa no fim (uma vez), como sempre foi. Com a página
// padrão (teamClassic) não anexa: o clássico já tem o texto automático.
export function needsAutoTextAppend(blocks: { blockType?: string }[]): boolean {
  return !blocks.some((b) => b?.blockType === "teamAutoText" || b?.blockType === "teamClassic");
}

// Nós do Lexical que só estruturam texto: sem texto dentro, não mostram nada. Qualquer
// outro tipo (upload, bloco, embed, linha horizontal...) conta como conteúdo.
const LEXICAL_TEXT_CONTAINERS = new Set([
  "root", "paragraph", "heading", "quote", "list", "listitem", "link", "autolink", "linebreak", "tab",
]);

function lexicalHasContent(node: unknown): boolean {
  if (!node || typeof node !== "object") return false;
  const n = node as { type?: unknown; text?: unknown; children?: unknown };
  if (n.type === "text") return typeof n.text === "string" && n.text.trim() !== "";
  if (typeof n.type === "string" && !LEXICAL_TEXT_CONTAINERS.has(n.type)) return true;
  return Array.isArray(n.children) && n.children.some(lexicalHasContent);
}

// Bloco estático vazio (texto sem conteúdo / título sem texto) não renderiza nada — o
// layout não deve deixar um wrapper com espaçamento no lugar dele. Texto do Lexical sem
// nenhum texto (ex.: um parágrafo vazio que o editor deixa) também conta como vazio.
export function isEmptyStaticBlock(block: LayoutBlock): boolean {
  if (block?.blockType === "richText") {
    const root = (block.content as { root?: unknown } | null | undefined)?.root;
    return !block.content || !lexicalHasContent(root);
  }
  if (block?.blockType === "heading") return !block.text;
  return false;
}
