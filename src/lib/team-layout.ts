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

// Bloco estático vazio (texto sem conteúdo / título sem texto) não renderiza nada — o
// layout não deve deixar um wrapper com espaçamento no lugar dele.
export function isEmptyStaticBlock(block: LayoutBlock): boolean {
  if (block?.blockType === "richText") return !block.content;
  if (block?.blockType === "heading") return !block.text;
  return false;
}
